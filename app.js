const imageUpload = document.getElementById("image-upload");
const generatePDF = document.getElementById("generate-pdf");

function generateContactSheet(images) {
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

  images.forEach((image, index) => {
    const x = (index % columns) * width + margin;
    const y = Math.floor(index / columns) * height + margin;

    if (index !== 0 && index % (columns * rows) === 0) {
      pdf.addPage();
    }

    pdf.addImage(image, "JPEG", x, y, width, height);
  });

  pdf.save("contact-sheet.pdf");
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
