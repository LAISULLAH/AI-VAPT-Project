import asyncio
import socket
from typing import List, Dict, Optional, Tuple
import logging
from datetime import datetime
import ipaddress
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedPortScanner:

    def __init__(self, timeout: float = 2.0, max_concurrent: int = 100):
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)

        self.port_categories = {
            'web': [80,443,8080,8443,8000,8888,3000,5000],
            'database': [3306,5432,27017,6379,9200,5672],
            'mail': [25,110,143,465,587,993,995],
            'file': [21,22,445,2049],
            'remote': [23,3389,5900,5901],
            'monitoring': [161,162,514,3000],
            'message': [1883,8883,5672,61613],
            'other': [53,123,389,636,873]
        }

        self.service_signatures = {
            21:'ftp',22:'ssh',23:'telnet',25:'smtp',53:'dns',80:'http',
            110:'pop3',111:'rpcbind',123:'ntp',135:'msrpc',139:'netbios',
            143:'imap',161:'snmp',162:'snmptrap',389:'ldap',443:'https',
            445:'smb',465:'smtps',514:'syslog',587:'smtp',636:'ldaps',
            873:'rsync',993:'imaps',995:'pop3s',1080:'socks',
            1433:'mssql',1521:'oracle',2049:'nfs',
            3306:'mysql',3389:'rdp',5432:'postgresql',
            6379:'redis',27017:'mongodb'
        }

    async def scan(self, target: str, ports: str = "1-1000", scan_type: str = "smart") -> Dict:

        start_time = datetime.now()

        target = await self._resolve_target(target)

        port_list = await self._get_port_list(ports, scan_type)

        logger.info(f"Scanning {target} - {len(port_list)} ports")

        open_ports = []
        batch_size = self.max_concurrent

        for i in range(0,len(port_list),batch_size):

            batch = port_list[i:i+batch_size]

            tasks = [self._scan_port(target,port) for port in batch]

            results = await asyncio.gather(*tasks)

            for port,is_open,banner in results:

                if is_open:

                    service = self._identify_service(port,banner)

                    open_ports.append({
                        "port":port,
                        "state":"open",
                        "service":service["name"],
                        "protocol":"tcp",
                        "banner":banner,
                        "confidence":service["confidence"],
                        "version":service["version"]
                    })

        scan_duration = (datetime.now() - start_time).total_seconds()

        return {
            "target":target,
            "scan_duration":scan_duration,
            "total_ports_scanned":len(port_list),
            "open_ports":open_ports
        }

    async def _resolve_target(self,target:str):

        try:
            ipaddress.ip_address(target)
            return target
        except:
            try:
                ip = socket.gethostbyname(target)
                logger.info(f"Resolved {target} -> {ip}")
                return ip
            except:
                return target

    async def _get_port_list(self,ports:str,scan_type:str)->List[int]:

        if "-" in ports:
            start,end = map(int,ports.split("-"))
            return list(range(start,end+1))

        return [int(p) for p in ports.split(",")]

    async def _scan_port(self,target:str,port:int)->Tuple[int,bool,Optional[str]]:

        async with self.semaphore:

            try:
                loop = asyncio.get_event_loop()

                sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
                sock.settimeout(self.timeout)

                result = await loop.run_in_executor(
                    None,
                    lambda: sock.connect_ex((target,port))
                )

                if result == 0:

                    banner = await self._grab_banner(sock,port)

                    sock.close()

                    return port,True,banner

                sock.close()

                return port,False,None

            except Exception as e:

                logger.debug(f"Port {port} scan error: {str(e)}")

                return port,False,None

    async def _grab_banner(self,sock:socket.socket,port:int)->Optional[str]:

        try:

            loop = asyncio.get_event_loop()

            probe = b"\r\n"

            await loop.run_in_executor(None,sock.send,probe)

            banner = await loop.run_in_executor(None,sock.recv,1024)

            return banner.decode("utf-8",errors="ignore").strip()

        except:
            return None

    def _identify_service(self,port:int,banner:Optional[str])->Dict:

        result = {
            "name":self.service_signatures.get(port,"unknown"),
            "version":None,
            "confidence":"low"
        }

        if banner:

            if "SSH" in banner:

                result["name"]="ssh"

                match = re.search(r"OpenSSH[_]?([\d\.]+)",banner)

                if match:
                    result["version"]=match.group(1)
                    result["confidence"]="high"

            elif "nginx" in banner.lower():

                result["name"]="nginx"

                match = re.search(r"nginx/([\d\.]+)",banner.lower())

                if match:
                    result["version"]=match.group(1)
                    result["confidence"]="high"

            elif "apache" in banner.lower():

                result["name"]="apache"

                match = re.search(r"apache/([\d\.]+)",banner.lower())

                if match:
                    result["version"]=match.group(1)
                    result["confidence"]="high"

        return result


async def port_scan(target:str,ports:str="1-1024")->Dict:

    scanner = AdvancedPortScanner()

    return await scanner.scan(target,ports)