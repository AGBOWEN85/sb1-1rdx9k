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
          Choose a .docx or .txt file
        </label>
        <input type="file" id="fileInput" accept=".docx,.txt,.md" />
      </div>
    `;
  }
}