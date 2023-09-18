FROM nginx

ENV GATEWAY_ENDPOINT http://gateway:18888
ENV DIST_PATH /dist

# 前端打包后的静态文件
COPY dist $DIST_PATH

# nginx配置模版
COPY ./docker/nginx.conf.template /etc/nginx/nginx.conf.template

# 启动脚本
COPY ./docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
