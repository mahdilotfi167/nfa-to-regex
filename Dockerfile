FROM nginx:alpine
COPY dist /usr/share/nginx/html/
ENTRYPOINT ["nginx", "-g", "daemon off;"]
