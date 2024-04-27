# Usage
1. Скопировать файл .env.example в .env и заполнить его
    ```bash
    cp .env.example .env
    ```
2. Сбросить базу данных
    ```bash 
    pnpm run reset
    ```
3. Собрать проект
    ```bash 
    pnpm run build
    ```
4. Запустить сервер
    ```bash
    pnpm run start
    ```
5. Остановить сервер когда все зарегались
    ```bash
    ctrl + c
    ```
6. Сгенерировать группы
    ```bash
    pnpm run gen
    ```
7. Отправить информацию о группах каждому юзеру
    ```bash
    pnpm run send-group-info
    ```
8. Открыть страницу с таблицей
    ```bash
    pnpm run open-html
    ```