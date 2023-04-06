const imageUpload = document.getElementById("image-upload");
const generateImage = document.getElementById("generate-image");

function applyExifOrientation(image) {
  return new Promise((resolve) => {
    EXIF.getData(image, function () {
      const orientation = EXIF.getTag(this, "Orientation");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      let width = image.width;
      let height = image.height;

      if (orientation && (orientation === 6 || orientation === 8)) {
        [width, height] = [height, width];
      }

      canvas.width = width;
      canvas.height = height;

      switch (orientation) {
        case 2:
          context.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          context.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          context.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          context.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          context.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          context.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          context.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          context.transform(1, 0, 0, 1, 0, 0);
      }

      context.drawImage(image, 0, 0, image.width, image.height);
      const correctedImage = new Image();
      correctedImage.src = canvas.toDataURL();
      correctedImage.onload = () => {
        resolve(correctedImage);
      };
    });
  });
}

async function generateContactSheet(images) {
  const columns = 4;
  const rows = 5;
  const margin = 20;
  const padding = 10;
  const cellWidth = 200;
  const cellHeight = 150;
  const width = columns * cellWidth + 2 * margin + (columns - 1) * padding;
  const height = rows * cellHeight + 2 * margin + (rows - 1) * padding;
  const maxImagesPerSheet = columns * rows;

  for (let sheetIndex = 0; sheetIndex * maxImagesPerSheet < images.length; sheetIndex++) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);

    const sheetStartIndex = sheetIndex * maxImagesPerSheet;
    const sheetEndIndex = Math.min(sheetStartIndex + maxImagesPerSheet, images.length);

    for (let i = sheetStartIndex; i < sheetEndIndex; i++) {
      const image = images[i];
      const x = ((i - sheetStartIndex) % columns) * (cellWidth + padding) + margin;
      const y = Math.floor((i - sheetStartIndex) / columns) * (cellHeight + padding) + margin;

      const aspectRatio = image.width / image.height;
      let newWidth = cellWidth;
      let newHeight = cellHeight;

      if (image.width > image.height) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }

      context.drawImage(
        image,
        x + (cellWidth - newWidth) / 2,
        y + (cellHeight - newHeight) / 2,
        newWidth,
        newHeight
      );
    }

    const dataUrl = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `contact-sheet-${sheetIndex + 1}.jpg`;
    link.click();
  }
}

function readImages(files) {
  const images = [];
  const promises = [];

  for (const file of files) {
    promises.push(
      new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const image = new Image();

          image.onload = async () => {
            const correctedImage = await applyExifOrientation(image);
            images.push(correctedImage);
            resolve();
          };

          image.src = e.target.result;
        };

        reader.readAsDataURL(file);
      })
    );
  }

  return Promise.all(promises).then(() => images);
}

generateImage.addEventListener("click", () => {
  if (imageUpload.files.length === 0) {
    alert("Please select images to upload.");
    return;
  }

  readImages(imageUpload.files).then((images) => {
    generateContactSheet(images);
  });
});

      
            
