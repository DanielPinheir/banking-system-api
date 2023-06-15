const { format } = require("date-fns");

let {
  lerArquivoConverterParaArrayJavaScript,
  converteArrayParaTextoEEscreveNoArquivo,
  caminhoArquivoBancoDeDados,
} = require("../utils/manipularDadosJson");

const {
  contaSelecionadaPeloNumero,
} = require("../utils/selecinarContaPeloNumero");

let bancoDeDados = lerArquivoConverterParaArrayJavaScript(
  caminhoArquivoBancoDeDados
);

//POST
const depositarNaConta = async (req, res) => {
  const { numero_conta, valor_transacao } = req.body;

  try {
    let dados = await bancoDeDados;

    let contaSelecionada = await contaSelecionadaPeloNumero(numero_conta);

    const indexContaSelecionada = dados.contas.findIndex(
      (conta) => Number(conta.numero) === Number(numero_conta)
    );

    contaSelecionada.saldo =
      Number(contaSelecionada.saldo) + Number(valor_transacao);

    dados.contas.splice(indexContaSelecionada, 1, contaSelecionada);

    const dataFormatada = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const registroDeposito = {
      data: dataFormatada,
      numero_conta: String(numero_conta),
      valor: Number(valor_transacao),
    };

    dados.depositos.push(registroDeposito);

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );

    return res.status(200).json({
      mensagem: `Depósito realizado com sucesso na conta: ${
        contaSelecionada.numero
      } de nome: ${contaSelecionada.usuario.nome} no valor de R$ ${(
        Number(valor_transacao) / 100
      ).toFixed(2)}. ${dados.banco.nome} agradece!`,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ mensagem: `Erro ${error.message} ao depositar na conta.` });
  }
};

const sacarDaConta = async (req, res) => {
  const { numero_conta, valor_transacao, senha } = req.body;

  if (!senha) {
    return res
      .status(400)
      .json({ mensagem: "Número da senha não informado na requisição." });
  }

  try {
    let dados = await bancoDeDados;

    const contaSelecionada = await contaSelecionadaPeloNumero(numero_conta);

    const indexContaSelecionada = dados.contas.findIndex(
      (conta) => Number(conta.numero) === Number(numero_conta)
    );

    const verificacaoSenha =
      String(contaSelecionada.usuario.senha) === String(senha);

    if (!verificacaoSenha) {
      return res.status(400).json({ mensagem: "Senha inválida." });
    }

    if (contaSelecionada.saldo <= 0) {
      return res.status(400).json({ mensagem: "Conta sem saldo." });
    }

    if (Number(contaSelecionada.saldo) < Number(valor_transacao)) {
      return res.status(400).json({ mensagem: "Saldo insuficiente." });
    }

    contaSelecionada.saldo =
      Number(contaSelecionada.saldo) - Number(valor_transacao);

    dados.contas.splice(indexContaSelecionada, 1, contaSelecionada);

    const dataFormatada = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const registroSaque = {
      data: dataFormatada,
      numero_conta: String(numero_conta),
      valor: Number(valor_transacao),
    };

    dados.saques.push(registroSaque);

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );

    return res.status(200).json({
      mensagem: `Saque realizado com sucesso na conta: ${
        contaSelecionada.numero
      } de ${contaSelecionada.usuario.nome} no valor de R$ ${(
        valor_transacao / 100
      ).toFixed(2)}. ${dados.banco.nome} agradece!`,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ mensagem: `Erro ${error.message} ao sacar na conta.` });
  }
};

const transferirParaOutraConta = async (req, res) => {
  const {
    numero_conta,
    numero_conta_destino,
    senha_conta_origem,
    valor_transacao,
  } = req.body;

  if (!numero_conta_destino) {
    return res.status(400).json({
      mensagem: "Número da conta de destino não informado na requisição.",
    });
  }
  if (!senha_conta_origem) {
    return res.status(400).json({
      mensagem: "Senha da conta de origem não informado na requisição.",
    });
  }

  try {
    let dados = await bancoDeDados;

    const contaOrigemSelecionada = await contaSelecionadaPeloNumero(
      numero_conta
    );

    const indexContaOrigemSelecionada = dados.contas.findIndex(
      (conta) => Number(conta.numero) === Number(numero_conta)
    );

    const contaDestinoSelecionada = await contaSelecionadaPeloNumero(
      numero_conta_destino
    );

    const indexContaDestinoSelecionada = dados.contas.findIndex(
      (conta) => Number(conta.numero) === Number(numero_conta_destino)
    );

    if (!contaDestinoSelecionada) {
      return res
        .status(400)
        .json({ mensagem: "Conta de destino inexistente." });
    }

    const validacaoSenhaContaOrigem =
      String(contaOrigemSelecionada.usuario.senha) ===
      String(senha_conta_origem);

    if (!validacaoSenhaContaOrigem) {
      return res.status(400).json({ Mensagem: "Senha inválida." });
    }

    if (Number(contaOrigemSelecionada.saldo) < Number(valor_transacao)) {
      return res.status(400).json({ mensagem: "Saldo insuficiente." });
    }

    contaOrigemSelecionada.saldo =
      Number(contaOrigemSelecionada.saldo) - Number(valor_transacao);

    contaDestinoSelecionada.saldo =
      Number(contaDestinoSelecionada.saldo) + Number(valor_transacao);

    dados.contas.splice(indexContaOrigemSelecionada, 1, contaOrigemSelecionada);
    dados.contas.splice(
      indexContaDestinoSelecionada,
      1,
      contaDestinoSelecionada
    );

    const dataFormatada = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const registroTransferencia = {
      data: dataFormatada,
      numero_conta_origem: String(numero_conta),
      numero_conta_destino: String(numero_conta_destino),
      valor: Number(valor_transacao),
    };

    dados.transferencias.push(registroTransferencia);

    await converteArrayParaTextoEEscreveNoArquivo(
      caminhoArquivoBancoDeDados,
      dados
    );

    return res.status(200).json({
      mensagem:
        "Transferência concluída com sucesso." +
        `${dados.banco.nome} agradece!`,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ mensagem: `Erro ${error.message} ao realizar a transferência.` });
  }
};

module.exports = {
  depositarNaConta,
  sacarDaConta,
  transferirParaOutraConta,
};
