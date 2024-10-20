FROM denoland/deno

EXPOSE 80

WORKDIR /app

ADD . /app

RUN deno install --entrypoint main.ts

CMD ["run", "--allow-net", "--allow-env",  "--allow-read", "main.ts"]