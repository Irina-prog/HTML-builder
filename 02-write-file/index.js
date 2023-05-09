const fs = require('fs'); // модуль для работы с файловой системой
const path = require('path'); // модуль для работы с путями

console.log('Введите текст. Для завершения нажмите ctrl + c или введите exit');
// создает файловый поток поток для записи. __dirname каталог в котором находится текущий js файл
// join добавляет/мержит переданные ему параметры с правильными слешами для OS
const fileStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));
// подписываемся к событиям входного потока stdin(standard input - что вводится с клавиатуры)
process.stdin.on('data', (data) => { // событие на приход данных с клавы
  const text = data.toString('utf-8'); // преобразуем буфер в строку
  if (text.includes('exit')){ // если есть слово exit 
    process.exit(0); // то завершаем процесс
    return;
  }
  // в противном случае просто пишем буфер в файловый поток
  fileStream.write(data);
});
// подписываемся на событие - ошибки
process.stdin.on('error', (error) => {
  console.error(`Ошибка при чтении данных: ${error.message}`);
  process.exit(1); // завершаем процесс сообщая операционке что была ошибка
});
// обработка нажатия CTRL+C
process.on('SIGINT', () => {
  process.exit(0);
});  
// подписка на событие - завершение процесса
process.on('exit', () => {
  fileStream.close(); // закрываем файловый поток
  console.log('Пока!'); // выводим прощальное сообщение
});