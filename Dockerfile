FROM denoland/deno:1.33.4 AS production
EXPOSE 3000
WORKDIR /app
RUN mkdir data && chown -R deno /app
USER deno
COPY --chown=deno deno_modules /app/deno_modules
RUN deno cache deno_modules/deps.ts
COPY --chown=deno src /app/src
RUN deno cache src/main.ts
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "src/main.ts"]