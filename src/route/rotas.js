const { Router } = require("express");

const {
  listarContas,
  cadastrarConta,
  atualizarConta,
  deletarConta,
  saldoDaConta,
  extratoDaConta,
} = require("../controller/contas");

const {
  depositarNaConta,
  sacarDaConta,
  transferirParaOutraConta,
} = require("../controller/transacoes");

const {
  validarCamposObrigatoriosContasBody,
  validarContaEncontradaParam,
  validarExclusividadeCpfEmailBody,
  validarSenhaBancoQuery,
  validarContaESenhaQuery,
} = require("../middleware/validacaoConta");

const { validarContaEValorBody } = require("../middleware/validacaoTransacao");

const router = Router();

router.get("/contas", validarSenhaBancoQuery, listarContas);
router.get("/contas/saldo", validarContaESenhaQuery, saldoDaConta);
router.get("/contas/extrato", validarContaESenhaQuery, extratoDaConta);
router.post(
  "/contas",
  validarCamposObrigatoriosContasBody,
  validarExclusividadeCpfEmailBody,
  cadastrarConta
);

router.post("/transacoes/depositar", validarContaEValorBody, depositarNaConta);
router.post("/transacoes/sacar", validarContaEValorBody, sacarDaConta);
router.post(
  "/transacoes/transferir",
  validarContaEValorBody,
  transferirParaOutraConta
);

router.put(
  "/contas/:numeroConta/usuario",
  validarCamposObrigatoriosContasBody,
  validarContaEncontradaParam,
  validarExclusividadeCpfEmailBody,
  atualizarConta
);
router.delete(
  "/contas/:numeroConta",
  validarContaEncontradaParam,
  deletarConta
);

module.exports = router;
