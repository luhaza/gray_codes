function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Zigguhooked Puzzle')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
