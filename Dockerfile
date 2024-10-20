FROM denoland/deno

EXPOSE 80

WORKDIR /app

ADD . /app

RUN deno install --entrypoint main.ts

CMD ["run", "--allow-net=localhost,[::1]:6379,192.168.1.1,[::]:8000", "--allow-env",  "--allow-read", "main.ts"]