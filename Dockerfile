# Базовый образ Node.js (легковесная версия на Alpine Linux)
FROM node:18-alpine

# Создаём рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект внутрь контейнера
COPY . .

# Собираем TypeScript
RUN npm run build

# Задаём команду, которая будет выполняться при запуске контейнера
# Для dev-режима может быть и "npm run dev", но сейчас для примера укажем старт продакшн-сборки
CMD ["npm", "run", "start:prod"]
