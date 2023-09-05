const Modal = {
    toggle(modal) {
        document.querySelector(modal).classList.toggle('active')
    }
}

const Storage = {
    get() {
        return (
            JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
        )
    },
    set(transactions) {
        localStorage.setItem(
            'dev.finances:transactions',
            JSON.stringify(transactions)
        )
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        let income = Transaction.incomes()
        let expense = Transaction.expenses()

        return income + expense
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td class="remove">
                <img class="remove button" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `

        return html
    },
    updateBalance() {
        let income = Transaction.incomes()
        let expense = Transaction.expenses()
        let total = Transaction.total()

        document.getElementById('incomeDisplay').innerHTML =
            Utils.formatCurrency(income)
        document.getElementById('expenseDisplay').innerHTML =
            Utils.formatCurrency(expense)
        document.getElementById('totalDisplay').innerHTML =
            Utils.formatCurrency(total)
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },
    formatDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''
        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    amountType: document.getElementById('amountType'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value * Number(this.amountType.value),
            date: this.date.value
        }
    },
    validateField() {
        const { description, amount, date } = Form.getValues()
        if (description.trim() === '' || amount == '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos.')
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return { description, amount, date }
    },
    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.toggle('.modal-overlay')
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)

        let theme = localStorage.getItem('dev.finances:theme') || 'green',
            DM = localStorage.getItem('dev.finances:dark-mode') || 'off',
            dmInput = document.getElementById('darkMode')

        dmInput.checked = DM == 'on' ? true : false
        document.documentElement.setAttribute('dark-mode', DM)

        document.querySelector('#DM label').innerHTML =
            DM == 'on' ? 'Ligado' : 'Desligado'

        dmInput.addEventListener('click', e => {
            document.documentElement.setAttribute(
                'dark-mode',
                e.target.checked ? 'on' : 'off'
            )
            document.querySelector('#DM label').innerHTML = e.target.checked
                ? 'Ligado'
                : 'Desligado'
            localStorage.setItem(
                'dev.finances:dark-mode',
                e.target.checked ? 'on' : 'off'
            )
        })

        document.documentElement.setAttribute('data-theme', theme)
    },
    reload() {
        DOM.clearTransactions()
        this.init()
    }
}

const Custom = {
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('dev.finances:theme', theme)
    },

    toggleDM(darkmode) {
        document.documentElement.setAttribute(
            'dark-mode',
            darkmode ? 'on' : 'off'
        )
        document.querySelector('#DM label').innerHTML = darkmode
            ? 'Ligado'
            : 'Desligado'
        localStorage.setItem('dev.finances:dark-mode', darkmode)
    }
}

App.init()
