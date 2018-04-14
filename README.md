# wxapp-pomeloclient
微信小程序pomelo客户端

#### 添加DNS配置
适配pomelo返回的IP+PORT地址转换成域名(util/dns.js)

#### nginx配置wss协议代理

```

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream pomelo_gate {
    server 127.0.0.1:3014;
}

upstream pomelo_connector {
    server 127.0.0.1:3050;
}

server {
   listen 443;

   server_name gate.xxxx.com;

   ssl on;
   ssl_certificate certificate/xxxx.pem;
   ssl_certificate_key certificate/xxxx.key;
   ssl_prefer_server_ciphers on;

   location / {
       proxy_pass http://pomelo_gate;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection $connection_upgrade;
   }
}

server {
   listen 443;

   server_name conn.xxxx.com;

   ssl on;
   ssl_certificate certificate/xxxx.pem;
   ssl_certificate_key certificate/xxxx.key;
   ssl_prefer_server_ciphers on;

   location / {
       proxy_pass http://pomelo_connector;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection $connection_upgrade;
   }
}

```
