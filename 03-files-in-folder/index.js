const fs = require('fs/promises'); // модуль для работы с файлами методы которого возвращают промисы
const path = require('path'); // модуль для работы с путями

async function main(){ // асинхронную функцию описываем
  const secretFolder = path.join(__dirname, 'secret-folder'); // путь делаем абсолютным к папке secret-folder
  const items = await fs.readdir(secretFolder, {withFileTypes: true}); // получаем содержимое этой папки
  for(const item of items) { // перебираем и анализируем
    if (item.isFile()){ // если это файл
      const stat = await fs.stat(path.join(secretFolder, item.name)); // получаем статистику этого файла, нужную для получения размера
      console.log(`${item.name} - ${path.extname(item.name).substring(1)} - ${(stat.size/1024).toFixed(3)}kb`);
    }
  }
}

main().catch(console.trace); // main асинхронную вызываем  с обработкой ошибок