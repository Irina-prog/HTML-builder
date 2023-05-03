const fs = require('fs');
const path = require('path');
fs
  .createReadStream(path.join(__dirname, 'text.txt')) // создали файловый поток на чтения для указанного в параметре файла
  .pipe(process.stdout); // файловый поток чтения перенаправляем
  // на standard output - поток на запись в консоль