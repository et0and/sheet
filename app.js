const imageUpload = document.getElementById("image-upload");
const generatePDF = document.getElementById("generate-pdf");

async function generateContactSheet(images) {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const columns = 4;
  const rows = 5;
  const margin = 20;
  const width = (pdf.internal.pageSize.width - 2 * margin) / columns;
  const height = (pdf.internal.pageSize.height - 2 * margin) / rows;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const x = (i % columns) * width + margin;
    const y = Math.floor(i / columns) * height + margin;

    if (i !== 0 && i % (columns * rows) === 0) {
      pdf.addPage();
    }

    await new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          pdf.addImage(dataUrl, "JPEG", x, y, width, height);
          resolve();
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    });
  }

  const pdfBlob = pdf.output("blob");
  const objectURL = URL.createObjectURL(pdfBlob);
  window.open(objectURL, "_blank");
}

function readImages(files) {
  const images = [];
  const promises = [];

  for (const file of files) {
    promises.push(
      new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const image = new Image();

          image.onload = () => {
            images.push(image);
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

generatePDF.addEventListener("click", () => {
  if (imageUpload.files.length === 0) {
    alert("Please select images to upload.");
    return;
  }

  readImages(imageUpload.files).then((images) => {
    generateContactSheet(images);
  });
});
