const { log } = require("console");
const fs = require("fs/promises");

const caminhoArquivoBancoDeDados = "./src/data/bancodedados.json";

const lerArquivoConverterParaArrayJavaScript = async (caminhoArquivo) => {
  let dados = await fs.readFile(caminhoArquivo);

  let dadosArray = JSON.parse(dados);

  return dadosArray;
};

const converteArrayParaTextoEEscreveNoArquivo = async (
  caminhoArquivo,
  array
) => {
  let dadosArrayJavascript = JSON.stringify(array);

  await fs.writeFile(caminhoArquivo, dadosArrayJavascript);
};

module.exports = {
  lerArquivoConverterParaArrayJavaScript,
  converteArrayParaTextoEEscreveNoArquivo,
  caminhoArquivoBancoDeDados,
};
