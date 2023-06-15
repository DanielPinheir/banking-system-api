let {
  lerArquivoConverterParaArrayJavaScript,
  caminhoArquivoBancoDeDados,
} = require("./manipularDadosJson");

let bancoDeDados = lerArquivoConverterParaArrayJavaScript(
  caminhoArquivoBancoDeDados
);

const contaSelecionadaPeloNumero = async (numeroConta) => {
  let dados = await bancoDeDados;
  return dados.contas.find(
    (conta) => Number(conta.numero) === Number(numeroConta)
  );
};

module.exports = {
  contaSelecionadaPeloNumero,
};
