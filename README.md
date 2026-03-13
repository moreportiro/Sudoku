# Числовая головоломка Судоку

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![1С:Предприятие](https://img.shields.io/badge/1С:Предприятие-8.3-yellow?style=flat)
![Apache](https://img.shields.io/badge/Apache-2.4-D22128?style=flat&logo=apache&logoColor=white)

## О проекте

Разработана головоломка Судоку с помощью **1С:Предприятие** и **React**. Используется алгоритм Фишера-Йетса (перемешивание массива), присутствуют 6 уровней сложности, авторизация, возможность сохранить победные игры.

🛢️ База данных **1С:Предприятие 8.3**

🔌 Библиотека для HTTP-запросов **axios**

⚛️ Библиотека **React**

🌐 Сервер **Apache**

## Начало

<div align="center">
  <img width="640" height="480" alt="image" src="https://github.com/user-attachments/assets/cf2331ab-4807-43e4-9d58-84bb1488c7b2" />
</div>

- Приветственный экран, в котором имеются кнопки `Новая игра` по середине экрана и `Войти / Регистрация` в правом верхнем углу.

## Авторизация

<div align="center">
  <img width="385" height="304" alt="image" src="https://github.com/user-attachments/assets/95a51632-d5fe-4409-8155-27540a52cce8" />
</div>

- Имеется возможность зарегистрировать аккаунт, для сохранения истории побед.
- Необходимо указать **Логин** и **Пароль**, после чего нажать на кнопку `Регистрация`.
- Если уже имеется аккаунт, следует нажать на кнопку `Войти` и заполнить поля **Логин** и **Пароль**.

<div align="center">
  <img width="206" height="54" alt="image" src="https://github.com/user-attachments/assets/d2dadf94-611b-491c-bd75-b45154316299" />
</div>

- После успешного входа, отобразится меню в правом верхнем углу где отображается **Логин** и имеются кнопки `История` и `Выйти`.

## История

<div align="center">
  <img width="391" height="500" alt="image" src="https://github.com/user-attachments/assets/378cda5a-cd8b-47c1-84ce-ca8ea08b4e3e" />
</div>

- История побед сохраняется только в том случае, когда пользователь авторизован и победил в игре.

## Сложность

<div align="center">
  <img width="442" height="602" alt="image" src="https://github.com/user-attachments/assets/c2f965d9-e806-4aa2-ae1e-46013d41b634" />
</div>

- После нажатия кнопки `Новая игра` на главной странице, пользователю предоставится выбор сложности.

| **Сложность**  | **Пустых клеток** |
|------------|:-------------:|
| Тест       | 1             |
| Очень легко| 20            |
| Легко      | 30            |
| Средне     | 40            |
| Сложно     | 50            |
| Эксперт    | 60            |

## Игра

<div align="center">
  <img width="492" height="693" alt="image" src="https://github.com/user-attachments/assets/303ee8c9-c13e-40bb-a760-f0a90295c29d" />
</div>

- После выбора сложности начнется игра, необходимо сначала выбрать ячейку, далее выбрать цифру.
- Под каждой цифрой отображается количество сколько раз цифра ещё может быть использована.
- Если ячейка подсветилась красным, значит цифра не подходит, следует выбрать данную ячейку и нажать на кнопку `Стереть`.
- Также присутствуют кнопки `Меню` слева сверху от поля для выхода назад и `Заново` над полем для переигровки.
- После успешного решения головоломки, появится _alert_ с оповещением о победе.

## Установка

### 1. База данных 1С

- Создать новую информационную базу в 1С:Предприятие
- Загрузить конфигурацию: **Конфигуратор → Администрирование → Загрузить информационную базу** → выбрать файл `.dt`

### 2. Веб-сервер Apache

- Запустить службу **Apache** (через `services.msc` или любым удобным способом)
- В **Конфигураторе** опубликовать базу на веб-сервере: **Администрирование → Публикация на веб-сервере** и настроить по примеру:

<div align="center">
  <img width="517" height="750" alt="image" src="https://github.com/user-attachments/assets/e7ce78d2-f9f3-40cd-b196-b6eb5b6f00ac" />
</div>

### 3. Клонирование репозитория
```bash
git clone git@github.com:moreportiro/Sudoku.git
cd Sudoku
```

### 4. Установка зависимостей
```bash
npm install
```

### 5. Запуск
```bash
node server.js
```
```bash
npm run dev
```