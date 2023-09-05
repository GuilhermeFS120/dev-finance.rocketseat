"use strict";

var Modal = {
  toggle: function toggle(modal) {
    document.querySelector(modal).classList.toggle('active');
  }
};
var Storage = {
  get: function get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
  },
  set: function set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
  }
};
var Transaction = {
  all: Storage.get(),
  add: function add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove: function remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes: function incomes() {
    var income = 0;
    Transaction.all.forEach(function (transaction) {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  expenses: function expenses() {
    var expense = 0;
    Transaction.all.forEach(function (transaction) {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },
  total: function total() {
    var income = Transaction.incomes();
    var expense = Transaction.expenses();
    return income + expense;
  }
};
var DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction: function addTransaction(transaction, index) {
    var tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction: function innerHTMLTransaction(transaction, index) {
    var CSSclass = transaction.amount > 0 ? 'income' : 'expense';
    var amount = Utils.formatCurrency(transaction.amount);
    var html = "\n            <td class=\"description\">".concat(transaction.description, "</td>\n            <td class=\"").concat(CSSclass, "\">").concat(amount, "</td>\n            <td class=\"date\">").concat(transaction.date, "</td>\n            <td class=\"remove\">\n                <img class=\"remove button\" onclick=\"Transaction.remove(").concat(index, ")\" src=\"./assets/minus.svg\" alt=\"Remover Transa\xE7\xE3o\">\n            </td>\n        ");
    return html;
  },
  updateBalance: function updateBalance() {
    var income = Transaction.incomes();
    var expense = Transaction.expenses();
    var total = Transaction.total();
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(income);
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(expense);
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(total);
  },
  clearTransactions: function clearTransactions() {
    DOM.transactionsContainer.innerHTML = '';
  }
};
var Utils = {
  formatAmount: function formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },
  formatDate: function formatDate(date) {
    var splittedDate = date.split('-');
    return "".concat(splittedDate[2], "/").concat(splittedDate[1], "/").concat(splittedDate[0]);
  },
  formatCurrency: function formatCurrency(value) {
    var signal = Number(value) < 0 ? '-' : '';
    value = String(value).replace(/\D/g, '');
    value = Number(value) / 100;
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    return signal + value;
  }
};
var Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  amountType: document.getElementById('amountType'),
  getValues: function getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value * Number(this.amountType.value),
      date: this.date.value
    };
  },
  validateField: function validateField() {
    var _Form$getValues = Form.getValues(),
        description = _Form$getValues.description,
        amount = _Form$getValues.amount,
        date = _Form$getValues.date;

    if (description.trim() === '' || amount == '' || date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos.');
    }
  },
  formatValues: function formatValues() {
    var _Form$getValues2 = Form.getValues(),
        description = _Form$getValues2.description,
        amount = _Form$getValues2.amount,
        date = _Form$getValues2.date;

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return {
      description: description,
      amount: amount,
      date: date
    };
  },
  clearFields: function clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
  },
  submit: function submit(event) {
    event.preventDefault();

    try {
      Form.validateField();
      var transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      Modal.toggle('.modal-overlay');
    } catch (error) {
      alert(error.message);
    }
  }
};
var App = {
  init: function init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all);
    var theme = localStorage.getItem('dev.finances:theme') || 'green',
        DM = localStorage.getItem('dev.finances:dark-mode') || 'off',
        dmInput = document.getElementById('darkMode');
    dmInput.checked = DM == 'on' ? true : false;
    document.documentElement.setAttribute('dark-mode', DM);
    document.querySelector('#DM label').innerHTML = DM == 'on' ? 'Ligado' : 'Desligado';
    dmInput.addEventListener('click', function (e) {
      document.documentElement.setAttribute('dark-mode', e.target.checked ? 'on' : 'off');
      document.querySelector('#DM label').innerHTML = e.target.checked ? 'Ligado' : 'Desligado';
      localStorage.setItem('dev.finances:dark-mode', e.target.checked ? 'on' : 'off');
    });
    document.documentElement.setAttribute('data-theme', theme);
  },
  reload: function reload() {
    DOM.clearTransactions();
    this.init();
  }
};
var Custom = {
  setTheme: function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dev.finances:theme', theme);
  },
  toggleDM: function toggleDM(darkmode) {
    document.documentElement.setAttribute('dark-mode', darkmode ? 'on' : 'off');
    document.querySelector('#DM label').innerHTML = darkmode ? 'Ligado' : 'Desligado';
    localStorage.setItem('dev.finances:dark-mode', darkmode);
  }
};
App.init();