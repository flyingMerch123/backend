# образ на котором будет работать докер контейнер
FROM node:18.15

ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port

# переключаемся на управление от пользователя node
USER node

# создаем директорию для проекта
RUN mkdir -p /home/node/dist/${SERVICE}

# один раз уразываем путь до рабочей директории внутри контейнера
WORKDIR /home/node/dist/${SERVICE}

# копируем эти файлы в контейнер для установки зависимостей проекта
COPY --chown=node package*.json ./
COPY --chown=node yarn.lock ./

# устанавливаем зависимостей внутри контейнера (без блокировки изменения версий пакетов)
RUN yarn install

# копируем файлы проекта
COPY --chown=node . .

# запускаем сборку проекта
RUN yarn build:${SERVICE}

# информируем докер, что контейнер прослушивает PORT во время выполнения
EXPOSE ${PORT}

# указываем команду и аргументы для выполнения внутри контейнера
CMD yarn 'start:inctagram-backend'


# для локальной сборки =>
# docker build . t inctagram-backend
# порт вне контейнера : порт внутри контейнера
# docker run -p 3003:3001 inctagram-backend