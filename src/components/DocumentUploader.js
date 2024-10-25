export class DocumentUploader {
  constructor(onFileSelect) {
    this.onFileSelect = onFileSelect;
    this.initialize();
  }

  initialize() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
          await this.onFileSelect(file);
        }
      });
    }
  }

  static createUploadButton() {
    return `
      <div class="upload-section">
        <label for="fileInput" class="file-input-label">
          Choose DOCX file
        </label>
        <input type="file" id="fileInput" accept=".docx" />
      </div>
    `;
  }
}