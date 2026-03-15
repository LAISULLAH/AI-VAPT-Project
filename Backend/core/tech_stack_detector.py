def detect_technology(headers):

    tech = []

    server = headers.get("Server","").lower()
    powered = headers.get("X-Powered-By","").lower()

    if "nginx" in server:
        tech.append("nginx")

    if "apache" in server:
        tech.append("apache")

    if "iis" in server:
        tech.append("iis")

    if "node" in powered:
        tech.append("node.js")

    if "php" in powered:
        tech.append("php")

    if "express" in powered:
        tech.append("express.js")

    if "wordpress" in headers.get("Link","").lower():
        tech.append("wordpress")

    return tech