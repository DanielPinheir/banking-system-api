let {
  lerArquivoConverterParaArrayJavaScript,
  caminhoArquivoBancoDeDados,
} = require("../utils/manipularDadosJson");

let {
  contaSelecionadaPeloNumero,
} = require("../utils/selecinarContaPeloNumero");

let bancoDeDados = lerArquivoConverterParaArrayJavaScript(
  caminhoArquivoBancoDeDados
);

const validarContaEValorBody = async (req, res, next) => {
  const { numero_conta, valor_transacao } = req.body;

  if (!numero_conta) {
    return res
      .status(400)
      .json({ mensagem: "Número da conta não informado na requisição." });
  }

  if (!valor_transacao) {
    return res
      .status(400)
      .json({ mensagem: "Valor da transação não informado na requisição." });
  }

  if (valor_transacao <= 0) {
    return res
      .status(400)
      .json({ mensagem: "Não é permitido valores negativos ou zerados!" });
  }

  const contaSelecionada = await contaSelecionadaPeloNumero(numero_conta);

  if (!contaSelecionada) {
    return res.status(400).json({ mensagem: "Conta inexistente!" });
  }

  next();
};

module.exports = {
  validarContaEValorBody,
};
