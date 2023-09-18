#!/bin/sh
envsubst '$DIST_PATH $GATEWAY_ENDPOINT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
