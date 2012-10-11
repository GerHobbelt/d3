d3.csv.format = function(rows) {
  return d3_array_map(rows, d3_csv_formatRow).join("\n");
};

function d3_csv_formatRow(row) {
  return d3_array_map(row, d3_csv_formatValue).join(",");
}

function d3_csv_formatValue(text) {
  return /[",\n]/.test(text)
      ? "\"" + text.replace(/\"/g, "\"\"") + "\""
      : text;
}
