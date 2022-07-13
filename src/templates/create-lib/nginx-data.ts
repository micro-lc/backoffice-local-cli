import type {FileWithPath} from './data'

const license = `# Copyright 2019 Mia srl
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#`

const nginxLatest: FileWithPath = ['nginx/conf.d/website.latest.conf',
  `${license}

location / {
include /etc/nginx/security.d/cross-site_script.conf;
add_header 'Content-Security-Policy' "default-src 'self' https: http:; script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self'; worker-src 'self' blob:" always;
add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';

expires -1;

try_files $uri $uri/index.html /index.html =404;
}  
`]

const nginxRelease: FileWithPath = ['nginx/conf.d/website.release.conf',
  `${license}

location / {
include /etc/nginx/security.d/cross-site_script.conf;
add_header 'Content-Security-Policy' "default-src 'self' https: http:; script-src 'self' 'unsafe-eval'; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self'; worker-src 'self' blob:" always;

expires $expires;

try_files $uri $uri/index.html /index.html =404;
}  
`]

const nginxSecurityXss: FileWithPath = ['nginx/security.d/cross-site_script.conf', 
  `${license}

# https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
add_header 'X-XSS-Protection' "1; mode=block" always;  
`]

const nginxSecurityDefault: FileWithPath = ['nginx/security.d/default_content_security.conf',
  `${license}

# https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
add_header 'Content-Security-Policy' "default-src 'self'" always;  
`]

const nginxCache: FileWithPath = ['nginx/filehandle_cache.conf',
  `${license}

open_file_cache max=5000 inactive=20s;
open_file_cache_valid 60s;
open_file_cache_min_uses 2;
open_file_cache_errors on;  
`]

const nginx: FileWithPath = ['nginx/nginx.conf', 
  `${license}

worker_processes 2;

error_log /var/log/nginx/error.log warn;

pid /tmp/nginx.pid;

events {
  worker_connections 4096;
}

http {

  client_body_temp_path /tmp/client_temp;
  proxy_temp_path       /tmp/proxy_temp_path;
  fastcgi_temp_path     /tmp/fastcgi_temp;
  uwsgi_temp_path       /tmp/uwsgi_temp;
  scgi_temp_path        /tmp/scgi_temp;

  log_format x_real_ip '$remote_addr $original_request_host [$time_iso8601] "$request" $status $bytes_sent '
                        '"$http_referer" "$http_user_agent" - $request_time - $original_request_id';

  include /etc/nginx/variables.conf;
  access_log /var/log/nginx/access.log x_real_ip buffer=32k flush=5m if=$loggable;

  server_tokens off;
  tcp_nopush on;
  tcp_nodelay on;
  sendfile on;

  include /etc/nginx/mime.types;
  include /etc/nginx/filehandle_cache.conf;
  include /etc/nginx/real_ip.conf;

  server {
    listen 8080 default_server;
    listen [::]:8080 default_server;

    root /usr/static;
    include /etc/nginx/conf.d/website.conf;
  }
}
`]

const nginxIp: FileWithPath = ['nginx/real_ip.conf', 
  `${license}

set_real_ip_from 127.0.0.1; # trust localhost
set_real_ip_from unix:; # trust local unix socket
set_real_ip_from 10.0.0.0/8; # trust class A private networks
set_real_ip_from 172.16.0.0/12; # trust class B private networks
set_real_ip_from 192.168.0.0/16; # trust class C private networks

real_ip_header X-Forwarded-For;
real_ip_recursive on;
`]

const nginxVars: FileWithPath = ['nginx/variables.conf', 
  `${license}

map $remote_addr $ip_loggable {
  default 1;
  "127.0.0.1" 0;
}

map $http_user_agent $agent_loggable {
  default 1;
  "~^kube-probe" 0;
}

map $ip_loggable-$agent_loggable $loggable {
  default 0;
  "1-1" 1;
}

# Get the request id from the upstream if exists or generate a new one
map $http_x_request_id $original_request_id {
  default $http_x_request_id;
  '' $request_id;
}

# Get the best host name possible from the upstream or client headers
map $http_x_forwarded_host $original_request_host {
  default $http_x_forwarded_host;
  '' $host;
}

# Get the original request scheme
map $http_x_forwarded_proto $original_request_scheme {
  default $http_x_forwarded_proto;
  '' $scheme;
}

map $sent_http_content_type $expires {
  default off;
  "~text/html" epoch;
  "~text/css" max;
  "~application/javascript" max;
  "~image/" max;
  "~font/" max;
}
`]

export default [
  nginxLatest,
  nginxRelease,
  nginxSecurityXss,
  nginxSecurityDefault,
  nginxCache,
  nginx,
  nginxIp,
  nginxVars
]
