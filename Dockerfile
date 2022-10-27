FROM node:16.18.0 AS app_stage


FROM node:16.18.0 AS backend_stage


FROM mysql:8.0.31 As db_stage
COPY init/* /docker-entrypoint-initdb.d/
