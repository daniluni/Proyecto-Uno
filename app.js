/* ==========================================================================
   VERDE - GESTOR DE FINANZAS PERSONALES
   Lógica JavaScript - State Management, LocalStorage, Dom Rendering & Charts
   ========================================================================== */

// 1. CONSTANTES Y CONFIGURACIONES
const CATEGORIES = {
    food: { name: 'Alimentación', color: '#10b981', icon: 'utensils', type: 'expense' },
    transport: { name: 'Transporte', color: '#3b82f6', icon: 'car', type: 'expense' },
    entertainment: { name: 'Entretenimiento', color: '#f59e0b', icon: 'film', type: 'expense' },
    utilities: { name: 'Servicios', color: '#6366f1', icon: 'bolt', type: 'expense' },
    home: { name: 'Hogar', color: '#ec4899', icon: 'home', type: 'expense' },
    health: { name: 'Salud', color: '#ef4444', icon: 'heart', type: 'expense' },
    education: { name: 'Educación', color: '#8b5cf6', icon: 'book-open', type: 'expense' },
    salary: { name: 'Salario', color: '#10b981', icon: 'briefcase', type: 'income' },
    investments: { name: 'Inversiones', color: '#06b6d4', icon: 'trending-up', type: 'income' },
    savings: { name: 'Ahorro', color: '#6366f1', icon: 'target', type: 'expense' },
    others: { name: 'Otros', color: '#64748b', icon: 'help-circle', type: 'both' }
};

const LOCAL_STORAGE_KEY = 'verde_finance_state';

// 2. ESTADO GLOBAL DE LA APLICACIÓN
let state = {
    transactions: [],
    budgets: {}, // { categoryId: limitAmount }
    goals: [] // [ { id, name, target, current, date } ]
};

// Instancias de Gráficos (Chart.js)
let expensesChartInstance = null;
let trendChartInstance = null;

// 3. DATOS SEMILLA (Seed Data) - Se usan la primera vez que se abre la app
const SEED_DATA = {
    transactions: [
        {
            id: 'seed-tx-1',
            desc: 'Salario mensual recibido',
            amount: 2500.00,
            type: 'income',
            category: 'salary',
            date: getRelativeDateStr(0), // hoy
            notes: 'Salario neto de la empresa'
        },
        {
            id: 'seed-tx-2',
            desc: 'Compra semanal de supermercado',
            amount: 124.50,
            type: 'expense',
            category: 'food',
            date: getRelativeDateStr(-2), // hace 2 días
            notes: 'Comida saludable para la semana'
        },
        {
            id: 'seed-tx-3',
            desc: 'Pago de Internet y Cable',
            amount: 60.00,
            type: 'expense',
            category: 'utilities',
            date: getRelativeDateStr(-5), // hace 5 días
            notes: 'Servicio de fibra óptica'
        },
        {
            id: 'seed-tx-4',
            desc: 'Suscripción de Netflix',
            amount: 15.99,
            type: 'expense',
            category: 'entertainment',
            date: getRelativeDateStr(-8),
            notes: 'Plan Familiar'
        },
        {
            id: 'seed-tx-5',
            desc: 'Proyecto Freelance de Diseño',
            amount: 450.00,
            type: 'income',
            category: 'investments',
            date: getRelativeDateStr(-10),
            notes: 'Diseño de logotipo'
        },
        {
            id: 'seed-tx-6',
            desc: 'Cena en restaurante italiano',
            amount: 45.00,
            type: 'expense',
            category: 'food',
            date: getRelativeDateStr(-12),
            notes: 'Cumpleaños de un amigo'
        },
        {
            id: 'seed-tx-7',
            desc: 'Carga de Combustible',
            amount: 40.00,
            type: 'expense',
            category: 'transport',
            date: getRelativeDateStr(-15),
            notes: 'Tanque lleno'
        }
    ],
    budgets: {
        food: 400.00,
        transport: 120.00,
        utilities: 200.00,
        entertainment: 150.00
    },
    goals: [
        {
            id: 'seed-goal-1',
            name: 'Fondo de Emergencia',
            target: 3000.00,
            current: 1200.00,
            date: getRelativeDateStr(180) // en 6 meses
        },
        {
            id: 'seed-goal-2',
            name: 'Viaje de Vacaciones',
            target: 1500.00,
            current: 450.00,
            date: getRelativeDateStr(240) // en 8 meses
        }
    ]
};

// Función auxiliar para fechas relativas
function getRelativeDateStr(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// 4. INICIALIZACIÓN DE LA APP
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    initAppViews();
    updateDateDisplay();
    lucide.createIcons();
});

// Cargar estado de Local Storage o sembrar datos
function loadState() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            state = JSON.parse(stored);
        } else {
            // Sembrar datos por defecto
            state = JSON.parse(JSON.stringify(SEED_DATA));
            saveState();
        }
    } catch (e) {
        console.error('Error al cargar datos de localStorage', e);
        state = JSON.parse(JSON.stringify(SEED_DATA));
    }
}

// Guardar estado en Local Storage
function saveState() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error al guardar datos en localStorage', e);
    }
}

// Configurar elementos de visualización inicial
function initAppViews() {
    populateCategoryDropdowns();
    renderDashboard();
    renderTransactionsTable();
    renderBudgets();
    renderGoals();
}

// Actualizar la visualización de la fecha
function updateDateDisplay() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('es-ES', options);
    }
}

// Llenar selectores de categorías en los formularios
function populateCategoryDropdowns() {
    const txCatSelect = document.getElementById('tx-category');
    const budgetCatSelect = document.getElementById('budget-category');
    const filterCatSelect = document.getElementById('filter-category');

    if (txCatSelect) {
        txCatSelect.innerHTML = Object.entries(CATEGORIES)
            .map(([key, cat]) => `<option value="${key}">${cat.name}</option>`)
            .join('');
    }
    
    if (budgetCatSelect) {
        budgetCatSelect.innerHTML = Object.entries(CATEGORIES)
            .filter(([key, cat]) => cat.type === 'expense' || cat.type === 'both')
            .map(([key, cat]) => `<option value="${key}">${cat.name}</option>`)
            .join('');
    }

    if (filterCatSelect) {
        filterCatSelect.innerHTML = `<option value="all">Todas</option>` + 
            Object.entries(CATEGORIES)
                .map(([key, cat]) => `<option value="${key}">${cat.name}</option>`)
                .join('');
    }
}

// ==========================================================================
// RENDERIZADO DE VISTAS Y COMPONENTES
// ==========================================================================

// --- VISTA 1: DASHBOARD ---
function renderDashboard() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Transacciones del mes actual
    const currentMonthTx = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Calcular ingresos y gastos del mes en curso
    const monthIncomes = currentMonthTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = currentMonthTx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Calcular balance general histórico
    const totalIncomes = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const generalBalance = totalIncomes - totalExpenses;

    // Actualizar tarjetas del DOM
    document.getElementById('dashboard-balance').textContent = formatCurrency(generalBalance);
    document.getElementById('dashboard-incomes').textContent = formatCurrency(monthIncomes);
    document.getElementById('dashboard-expenses').textContent = formatCurrency(monthExpenses);

    // Actualizar indicador de balance
    const balanceTrend = document.getElementById('balance-trend');
    if (balanceTrend) {
        if (generalBalance < 0) {
            balanceTrend.className = 'trend-indicator text-danger';
            balanceTrend.innerHTML = `<i data-lucide="trending-down"></i><span>Tu balance es negativo. ¡Cuidado!</span>`;
        } else if (generalBalance === 0) {
            balanceTrend.className = 'trend-indicator text-warning';
            balanceTrend.innerHTML = `<i data-lucide="minus"></i><span>Balance neutral. Agrega ingresos.</span>`;
        } else {
            balanceTrend.className = 'trend-indicator text-success';
            balanceTrend.innerHTML = `<i data-lucide="trending-up"></i><span>Presupuesto saludable</span>`;
        }
    }

    // Actualizar porcentajes secundarios
    const incomePercentVal = document.getElementById('income-percentage-value');
    if (incomePercentVal) {
        const percentage = totalIncomes > 0 ? ((monthIncomes / totalIncomes) * 100).toFixed(0) : 0;
        incomePercentVal.textContent = `${percentage}%`;
    }

    const expensePercentVal = document.getElementById('expense-percentage-value');
    if (expensePercentVal) {
        const savingsRate = monthIncomes > 0 ? (((monthIncomes - monthExpenses) / monthIncomes) * 100).toFixed(0) : 0;
        expensePercentVal.textContent = `${savingsRate > 0 ? savingsRate : 0}%`;
    }

    // Renderizar lista rápida reciente (últimas 5)
    renderRecentTransactionsList();

    // Renderizar Gráficos
    renderCharts(currentMonth, currentYear);

    // Re-iniciar iconos de Lucide
    lucide.createIcons();
}

// Lista rápida de transacciones recientes
function renderRecentTransactionsList() {
    const tbody = document.getElementById('recent-transactions-tbody');
    if (!tbody) return;

    // Obtener las últimas 5 transacciones ordenadas por fecha
    const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 5);

    if (recent.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="5">
                    <div class="empty-state-content">
                        <i data-lucide="file-text"></i>
                        <p>No hay transacciones registradas todavía.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recent.map(t => {
        const cat = CATEGORIES[t.category] || CATEGORIES.others;
        return `
            <tr>
                <td><strong>${escapeHtml(t.desc)}</strong></td>
                <td>
                    <span class="category-badge" style="background-color: ${cat.color}15; color: ${cat.color}">
                        <i data-lucide="${cat.icon}" class="category-icon"></i>
                        ${cat.name}
                    </span>
                </td>
                <td>${formatDate(t.date)}</td>
                <td>
                    <span class="type-badge ${t.type}">
                        ${t.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                </td>
                <td>
                    <span class="amount-text ${t.type}">
                        ${formatCurrency(t.amount)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// --- VISTA 2: HISTORIAL DE TRANSACCIONES ---
function renderTransactionsTable() {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;

    const query = document.getElementById('filter-search').value.toLowerCase().trim();
    const typeFilter = document.getElementById('filter-type').value;
    const catFilter = document.getElementById('filter-category').value;
    const sortFilter = document.getElementById('filter-sort').value;

    // Filtrar transacciones
    let filtered = state.transactions.filter(t => {
        const catObj = CATEGORIES[t.category] || CATEGORIES.others;
        const matchesQuery = t.desc.toLowerCase().includes(query) || catObj.name.toLowerCase().includes(query);
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesCat = catFilter === 'all' || t.category === catFilter;
        
        return matchesQuery && matchesType && matchesCat;
    });

    // Ordenar
    filtered.sort((a, b) => {
        if (sortFilter === 'date-desc') {
            return new Date(b.date) - new Date(a.date);
        } else if (sortFilter === 'date-asc') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortFilter === 'amount-desc') {
            return b.amount - a.amount;
        } else if (sortFilter === 'amount-asc') {
            return a.amount - b.amount;
        }
        return 0;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-state-content">
                        <i data-lucide="filter"></i>
                        <p>No se encontraron transacciones con los filtros actuales.</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const cat = CATEGORIES[t.category] || CATEGORIES.others;
        return `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td>
                    <div class="tx-desc-cell">
                        <strong>${escapeHtml(t.desc)}</strong>
                        ${t.notes ? `<p class="tx-note-text">${escapeHtml(t.notes)}</p>` : ''}
                    </div>
                </td>
                <td>
                    <span class="category-badge" style="background-color: ${cat.color}15; color: ${cat.color}">
                        <i data-lucide="${cat.icon}" class="category-icon"></i>
                        ${cat.name}
                    </span>
                </td>
                <td>
                    <span class="type-badge ${t.type}">
                        ${t.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                </td>
                <td>
                    <span class="amount-text ${t.type}">
                        ${formatCurrency(t.amount)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="icon-action-btn edit-btn" onclick="openEditTransaction('${t.id}')" title="Editar">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="icon-action-btn delete-btn" onclick="deleteTransaction('${t.id}')" title="Eliminar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

// --- VISTA 3: PRESUPUESTOS ---
function renderBudgets() {
    const container = document.getElementById('budgets-grid-container');
    if (!container) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Agrupar gastos del mes actual por categoría
    const monthlyExpensesByCat = {};
    
    // Inicializar todas las categorías de gastos en cero
    Object.keys(CATEGORIES).forEach(key => {
        if (CATEGORIES[key].type === 'expense' || CATEGORIES[key].type === 'both') {
            monthlyExpensesByCat[key] = 0;
        }
    });

    // Sumar gastos del mes
    state.transactions.forEach(t => {
        if (t.type === 'expense') {
            const d = new Date(t.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                if (monthlyExpensesByCat[t.category] !== undefined) {
                    monthlyExpensesByCat[t.category] += t.amount;
                } else {
                    monthlyExpensesByCat[t.category] = t.amount;
                }
            }
        }
    });

    const categoriesWithBudgets = Object.entries(state.budgets);

    if (categoriesWithBudgets.length === 0) {
        container.innerHTML = `
            <div class="span-full" style="width: 100%;">
                <div class="empty-state-content" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); background-color: var(--bg-card); padding: 60px 20px;">
                    <i data-lucide="sliders"></i>
                    <h3>No has configurado ningún presupuesto</h3>
                    <p style="max-width: 400px; margin: 8px auto 20px auto; text-align: center;">Controla tus finanzas estableciendo límites de gasto mensual para cada categoría.</p>
                    <button class="primary-btn" id="btn-empty-add-budget">
                        <i data-lucide="plus"></i> Establecer Presupuesto
                    </button>
                </div>
            </div>
        `;
        
        const btn = document.getElementById('btn-empty-add-budget');
        if (btn) {
            btn.addEventListener('click', () => openModal('modal-budget'));
        }
        lucide.createIcons();
        return;
    }

    container.innerHTML = categoriesWithBudgets.map(([catKey, limit]) => {
        const cat = CATEGORIES[catKey] || CATEGORIES.others;
        const spent = monthlyExpensesByCat[catKey] || 0;
        
        let percentage = limit > 0 ? ((spent / limit) * 100) : 0;
        let percentageText = percentage.toFixed(0);
        
        // Determinar color de barra según progreso
        let progressClass = 'progress-safe';
        let statusText = `Quedan ${formatCurrency(limit - spent)}`;
        let textClass = 'text-success';

        if (percentage >= 100) {
            progressClass = 'progress-danger';
            statusText = `¡Excedido por ${formatCurrency(spent - limit)}!`;
            textClass = 'text-danger';
        } else if (percentage >= 80) {
            progressClass = 'progress-warning';
            statusText = `Cerca del límite: quedan ${formatCurrency(limit - spent)}`;
            textClass = 'text-warning';
        }

        return `
            <div class="budget-card">
                <div class="budget-card-header">
                    <div class="budget-category-info">
                        <span class="category-badge" style="background-color: ${cat.color}15; color: ${cat.color}">
                            <i data-lucide="${cat.icon}" class="category-icon"></i>
                        </span>
                        <strong>${cat.name}</strong>
                    </div>
                    <div class="table-actions">
                        <button class="icon-action-btn edit-btn" onclick="openEditBudget('${catKey}', ${limit})" title="Editar límite">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="icon-action-btn delete-btn" onclick="deleteBudget('${catKey}')" title="Eliminar presupuesto">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="budget-values">
                    <div class="budget-spent">${formatCurrency(spent)}</div>
                    <div class="budget-limit">Límite mensual: ${formatCurrency(limit)}</div>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>

                <div class="budget-card-footer">
                    <span class="budget-status-text ${textClass}">${statusText}</span>
                    <span class="budget-percentage">${percentageText}%</span>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// --- VISTA 4: METAS DE AHORRO ---
function renderGoals() {
    const container = document.getElementById('goals-grid-container');
    if (!container) return;

    if (state.goals.length === 0) {
        container.innerHTML = `
            <div class="span-full" style="width: 100%;">
                <div class="empty-state-content" style="border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); background-color: var(--bg-card); padding: 60px 20px;">
                    <i data-lucide="target"></i>
                    <h3>Aún no tienes metas de ahorro</h3>
                    <p style="max-width: 400px; margin: 8px auto 20px auto; text-align: center;">Define propósitos como un fondo de emergencia, vacaciones o la compra de un auto, y hazles seguimiento.</p>
                    <button class="primary-btn" id="btn-empty-add-goal">
                        <i data-lucide="plus"></i> Nueva Meta
                    </button>
                </div>
            </div>
        `;
        
        const btn = document.getElementById('btn-empty-add-goal');
        if (btn) {
            btn.addEventListener('click', () => {
                document.getElementById('goal-id').value = '';
                document.getElementById('goal-modal-title').textContent = 'Nueva Meta de Ahorro';
                document.getElementById('form-goal').reset();
                openModal('modal-goal');
            });
        }
        lucide.createIcons();
        return;
    }

    container.innerHTML = state.goals.map(g => {
        const percentage = g.target > 0 ? ((g.current / g.target) * 100) : 0;
        const percentageText = percentage.toFixed(0);
        
        // Formatear fecha límite
        let dateHtml = '';
        if (g.date) {
            dateHtml = `
                <span class="goal-date-tag">
                    <i data-lucide="calendar"></i>
                    Límite: ${formatDate(g.date)}
                </span>
            `;
        }

        return `
            <div class="goal-card">
                <div class="goal-card-header">
                    <div class="goal-title-wrapper">
                        <h3>${escapeHtml(g.name)}</h3>
                        ${dateHtml}
                    </div>
                    <div class="table-actions">
                        <button class="icon-action-btn edit-btn" onclick="openEditGoal('${g.id}')" title="Editar meta">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="icon-action-btn delete-btn" onclick="deleteGoal('${g.id}')" title="Eliminar meta">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>

                <div class="goal-progress-values">
                    <div class="goal-val">
                        <span class="label">Objetivo</span>
                        <span class="val">${formatCurrency(g.target)}</span>
                    </div>
                    <div class="goal-val">
                        <span class="label">Ahorrado</span>
                        <span class="val saved">${formatCurrency(g.current)}</span>
                    </div>
                </div>

                <div class="goal-progress-bar-group">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill goal-progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="bar-info">
                        <span>Progreso total</span>
                        <strong>${percentageText}%</strong>
                    </div>
                </div>

                <div class="goal-actions">
                    <button class="primary-btn" onclick="openAddContribution('${g.id}')">
                        <i data-lucide="piggy-bank"></i>
                        <span>Aportar Fondos</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ==========================================================================
// RENDERIZADO DE GRÁFICOS (CHART.JS)
// ==========================================================================

function renderCharts(currentMonth, currentYear) {
    renderExpensesChart(currentMonth, currentYear);
    renderTrendChart();
}

// 1. Gráfico de distribución de gastos (Doughnut)
function renderExpensesChart(currentMonth, currentYear) {
    const canvas = document.getElementById('expenses-chart');
    const noDataEl = document.getElementById('no-expenses-chart-data');
    if (!canvas) return;

    // Destruir instancia anterior si existe
    if (expensesChartInstance) {
        expensesChartInstance.destroy();
    }

    // Filtrar gastos del mes
    const expensesTx = state.transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (expensesTx.length === 0) {
        canvas.classList.add('hidden');
        if (noDataEl) noDataEl.classList.remove('hidden');
        return;
    }

    canvas.classList.remove('hidden');
    if (noDataEl) noDataEl.classList.add('hidden');

    // Agrupar montos por categoría
    const categoriesMap = {};
    expensesTx.forEach(t => {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
    });

    const labels = [];
    const data = [];
    const backgroundColors = [];

    Object.entries(categoriesMap).forEach(([key, val]) => {
        const cat = CATEGORIES[key] || CATEGORIES.others;
        labels.push(cat.name);
        data.push(val);
        backgroundColors.push(cat.color);
    });

    // Configurar Chart.js
    const ctx = canvas.getContext('2d');
    expensesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#1e293b', // coincide con --bg-card
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8', // --text-secondary
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 12
                        },
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// 2. Gráfico de Ingresos vs Gastos Mensuales (Tendencia)
function renderTrendChart() {
    const canvas = document.getElementById('trend-chart');
    const noDataEl = document.getElementById('no-trend-chart-data');
    if (!canvas) return;

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    if (state.transactions.length === 0) {
        canvas.classList.add('hidden');
        if (noDataEl) noDataEl.classList.remove('hidden');
        return;
    }

    canvas.classList.remove('hidden');
    if (noDataEl) noDataEl.classList.add('hidden');

    // Agrupar por mes en los últimos 6 meses
    const last6Months = [];
    const date = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        last6Months.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            label: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
            income: 0,
            expense: 0
        });
    }

    // Sumar montos de transacciones
    state.transactions.forEach(t => {
        const tDate = new Date(t.date);
        const tMonth = tDate.getMonth();
        const tYear = tDate.getFullYear();

        const monthBucket = last6Months.find(m => m.month === tMonth && m.year === tYear);
        if (monthBucket) {
            if (t.type === 'income') {
                monthBucket.income += t.amount;
            } else if (t.type === 'expense') {
                monthBucket.expense += t.amount;
            }
        }
    });

    const labels = last6Months.map(m => m.label);
    const incomesData = last6Months.map(m => m.income);
    const expensesData = last6Months.map(m => m.expense);

    const ctx = canvas.getContext('2d');
    trendChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomesData,
                    backgroundColor: '#10b981', // --primary
                    borderRadius: 6,
                    borderWidth: 0,
                    barPercentage: 0.8,
                    categoryPercentage: 0.6
                },
                {
                    label: 'Gastos',
                    data: expensesData,
                    backgroundColor: '#f43f5e', // --danger
                    borderRadius: 6,
                    borderWidth: 0,
                    barPercentage: 0.8,
                    categoryPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        },
                        boxWidth: 12
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// ==========================================================================
// CONTROLADORES DE EVENTOS (EVENT LISTENERS)
// ==========================================================================

function setupEventListeners() {
    // 1. Navegación SPA
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');
    const sidebar = document.getElementById('app-sidebar');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover active de todos los botones y views
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Activar botón seleccionado
            btn.classList.add('active');
            
            // Activar vista asociada
            const viewId = `view-${btn.getAttribute('data-view')}`;
            const targetView = document.getElementById(viewId);
            if (targetView) {
                targetView.classList.add('active');
            }

            // En móviles, cerrar sidebar al navegar
            if (sidebar) {
                sidebar.classList.remove('mobile-open');
            }
            
            // Forzar actualización si es necesario
            if (viewId === 'view-dashboard') renderDashboard();
            if (viewId === 'view-transactions') renderTransactionsTable();
            if (viewId === 'view-budgets') renderBudgets();
            if (viewId === 'view-goals') renderGoals();
        });
    });

    // Enlace de "Ver todas" del Dashboard
    const viewAllBtn = document.getElementById('btn-view-all-transactions');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const txNavBtn = document.getElementById('btn-nav-transactions');
            if (txNavBtn) txNavBtn.click();
        });
    }

    // Toggle Sidebar en Móviles
    const menuToggle = document.getElementById('menu-toggle-btn');
    const closeSidebar = document.getElementById('close-sidebar-btn');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('mobile-open');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
        });
    }

    // 2. Control de Modales (Abrir / Cerrar por botones de clase)
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.getAttribute('data-close-modal'));
        });
    });

    // Cerrar modales haciendo click fuera del card
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Botones para abrir creación
    const quickTxBtn = document.getElementById('btn-quick-transaction');
    const addTxBtn = document.getElementById('btn-add-transaction');
    const addBudgetBtn = document.getElementById('btn-add-budget');
    const addGoalBtn = document.getElementById('btn-add-goal');

    if (quickTxBtn) {
        quickTxBtn.addEventListener('click', () => {
            openAddTransactionForm();
        });
    }
    if (addTxBtn) {
        addTxBtn.addEventListener('click', () => {
            openAddTransactionForm();
        });
    }
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener('click', () => {
            document.getElementById('form-budget').reset();
            openModal('modal-budget');
        });
    }
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', () => {
            document.getElementById('goal-id').value = '';
            document.getElementById('goal-modal-title').textContent = 'Nueva Meta de Ahorro';
            document.getElementById('form-goal').reset();
            openModal('modal-goal');
        });
    }

    // 3. Envío de Formularios
    
    // Formulario Transacción
    const formTx = document.getElementById('form-transaction');
    if (formTx) {
        formTx.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveTransaction();
        });
    }

    // Formulario Presupuesto
    const formBudget = document.getElementById('form-budget');
    if (formBudget) {
        formBudget.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveBudget();
        });
    }

    // Formulario Meta
    const formGoal = document.getElementById('form-goal');
    if (formGoal) {
        formGoal.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveGoal();
        });
    }

    // Formulario Aporte
    const formContribution = document.getElementById('form-contribution');
    if (formContribution) {
        formContribution.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveContribution();
        });
    }

    // Formulario Importar
    const formImport = document.getElementById('form-import');
    if (formImport) {
        formImport.addEventListener('submit', (e) => {
            e.preventDefault();
            handleImportJSON();
        });
    }

    // 4. Filtros de Transacciones
    const searchFilterInput = document.getElementById('filter-search');
    const typeFilterSelect = document.getElementById('filter-type');
    const catFilterSelect = document.getElementById('filter-category');
    const sortFilterSelect = document.getElementById('filter-sort');

    if (searchFilterInput) searchFilterInput.addEventListener('input', renderTransactionsTable);
    if (typeFilterSelect) typeFilterSelect.addEventListener('change', renderTransactionsTable);
    if (catFilterSelect) catFilterSelect.addEventListener('change', renderTransactionsTable);
    if (sortFilterSelect) sortFilterSelect.addEventListener('change', renderTransactionsTable);

    // 5. Botones de Datos / Respaldo
    const exportBtn = document.getElementById('btn-export-data');
    const importBtn = document.getElementById('btn-import-data');
    const resetBtn = document.getElementById('btn-reset-data');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportDataAsJSON();
        });
    }
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            openModal('modal-import');
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            handleResetData();
        });
    }
}

// ==========================================================================
// FUNCIONES AUXILIARES Y MANEJADORES LÓGICOS
// ==========================================================================

// Abrir Modal
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
    }
}

// Cerrar Modal
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Inicializar formulario de transacción en modo "Crear"
function openAddTransactionForm() {
    document.getElementById('tx-id').value = '';
    document.getElementById('transaction-modal-title').textContent = 'Nueva Transacción';
    document.getElementById('form-transaction').reset();
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
    openModal('modal-transaction');
}

// Manejar Guardado de Transacción (Añadir / Editar)
function handleSaveTransaction() {
    const id = document.getElementById('tx-id').value;
    const desc = document.getElementById('tx-desc').value.trim();
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const type = document.querySelector('input[name="tx-type"]:checked').value;
    const category = document.getElementById('tx-category').value;
    const date = document.getElementById('tx-date').value;
    const notes = document.getElementById('tx-notes').value.trim();

    if (!desc || isNaN(amount) || amount <= 0 || !category || !date) {
        alert('Por favor, ingresa todos los campos obligatorios de forma válida.');
        return;
    }

    if (id) {
        // Modo Editar
        const index = state.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            state.transactions[index] = { ...state.transactions[index], desc, amount, type, category, date, notes };
        }
    } else {
        // Modo Crear
        const newTx = {
            id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            desc,
            amount,
            type,
            category,
            date,
            notes
        };
        state.transactions.push(newTx);
    }

    saveState();
    closeModal('modal-transaction');
    
    // Actualizar vistas
    renderDashboard();
    renderTransactionsTable();
    renderBudgets();
    renderGoals();
}

// Editar Transacción
window.openEditTransaction = function(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    document.getElementById('tx-id').value = tx.id;
    document.getElementById('transaction-modal-title').textContent = 'Editar Transacción';
    document.getElementById('tx-desc').value = tx.desc;
    document.getElementById('tx-amount').value = tx.amount;
    
    // Configurar tipo de transacción
    if (tx.type === 'income') {
        document.getElementById('tx-type-income').checked = true;
    } else {
        document.getElementById('tx-type-expense').checked = true;
    }

    document.getElementById('tx-category').value = tx.category;
    document.getElementById('tx-date').value = tx.date;
    document.getElementById('tx-notes').value = tx.notes || '';

    openModal('modal-transaction');
};

// Eliminar Transacción
window.deleteTransaction = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        
        renderDashboard();
        renderTransactionsTable();
        renderBudgets();
        renderGoals();
    }
};

// Manejar Guardado de Presupuesto
function handleSaveBudget() {
    const category = document.getElementById('budget-category').value;
    const limit = parseFloat(document.getElementById('budget-amount').value);

    if (!category || isNaN(limit) || limit < 0) {
        alert('Por favor ingrese un límite válido.');
        return;
    }

    state.budgets[category] = limit;
    saveState();
    closeModal('modal-budget');
    
    renderDashboard();
    renderBudgets();
}

// Editar Presupuesto
window.openEditBudget = function(categoryKey, limitAmount) {
    document.getElementById('budget-category').value = categoryKey;
    document.getElementById('budget-amount').value = limitAmount;
    openModal('modal-budget');
};

// Eliminar Presupuesto
window.deleteBudget = function(categoryKey) {
    if (confirm(`¿Deseas eliminar el presupuesto configurado para ${CATEGORIES[categoryKey].name}?`)) {
        delete state.budgets[categoryKey];
        saveState();
        renderBudgets();
    }
};

// Manejar Guardado de Meta (Crear / Editar)
function handleSaveGoal() {
    const id = document.getElementById('goal-id').value;
    const name = document.getElementById('goal-name').value.trim();
    const target = parseFloat(document.getElementById('goal-target').value);
    const initialSaved = parseFloat(document.getElementById('goal-current').value) || 0;
    const date = document.getElementById('goal-date').value;

    if (!name || isNaN(target) || target <= 0) {
        alert('Por favor ingrese campos válidos.');
        return;
    }

    if (id) {
        // Editar
        const index = state.goals.findIndex(g => g.id === id);
        if (index !== -1) {
            state.goals[index] = { ...state.goals[index], name, target, date };
        }
    } else {
        // Crear
        const newGoal = {
            id: 'goal-' + Date.now(),
            name,
            target,
            current: initialSaved,
            date
        };
        state.goals.push(newGoal);
    }

    saveState();
    closeModal('modal-goal');
    
    renderDashboard();
    renderGoals();
}

// Editar Meta
window.openEditGoal = function(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    document.getElementById('goal-id').value = goal.id;
    document.getElementById('goal-modal-title').textContent = 'Editar Meta de Ahorro';
    document.getElementById('goal-name').value = goal.name;
    document.getElementById('goal-target').value = goal.target;
    // Deshabilitar edición de ahorrado acumulado en edición de estructura (para eso se usa Aportar)
    document.getElementById('goal-current').value = goal.current;
    document.getElementById('goal-current').disabled = true;
    document.getElementById('goal-date').value = goal.date || '';

    openModal('modal-goal');
};

// Reactivar input de ahorrado al cerrar/abrir form
const goalModalEl = document.getElementById('modal-goal');
if (goalModalEl) {
    // Escuchar el cierre para volver a activar el input
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                if (!goalModalEl.classList.contains('active')) {
                    document.getElementById('goal-current').disabled = false;
                }
            }
        });
    });
    observer.observe(goalModalEl, { attributes: true });
}

// Eliminar Meta
window.deleteGoal = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta meta? Se perderá el registro de ahorro.')) {
        state.goals = state.goals.filter(g => g.id !== id);
        saveState();
        renderGoals();
    }
};

// Abrir Aportar Fondos a Meta
window.openAddContribution = function(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    document.getElementById('contribution-goal-id').value = goal.id;
    document.getElementById('contribution-goal-name').textContent = goal.name;
    document.getElementById('contribution-goal-status').textContent = `Acumulado: ${formatCurrency(goal.current)} de ${formatCurrency(goal.target)}`;
    document.getElementById('contribution-amount').value = '';
    
    openModal('modal-contribution');
};

// Guardar Aporte a Meta
function handleSaveContribution() {
    const id = document.getElementById('contribution-goal-id').value;
    const amount = parseFloat(document.getElementById('contribution-amount').value);
    const syncTx = document.getElementById('contribution-sync-transaction').checked;

    if (isNaN(amount) || amount <= 0) {
        alert('Ingrese un monto de aporte válido.');
        return;
    }

    const index = state.goals.findIndex(g => g.id === id);
    if (index === -1) return;

    const goal = state.goals[index];
    
    // Sumar el aporte al progreso de la meta
    state.goals[index].current += amount;

    // Si se decide descontar del balance, crear una transacción
    if (syncTx) {
        const syncTxObject = {
            id: 'tx-sync-' + Date.now(),
            desc: `Aporte a meta: ${goal.name}`,
            amount: amount,
            type: 'expense',
            category: 'savings',
            date: new Date().toISOString().split('T')[0],
            notes: 'Aporte automático generado desde metas de ahorro.'
        };
        state.transactions.push(syncTxObject);
    }

    saveState();
    closeModal('modal-contribution');

    renderDashboard();
    renderGoals();
    renderBudgets();
    renderTransactionsTable();
}

// --- RESPALDOS: EXPORTAR, IMPORTAR Y RESETEAR ---

// Exportar Datos
function exportDataAsJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `verde_finance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Importar Datos
function handleImportJSON() {
    const fileInput = document.getElementById('import-file');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Por favor, selecciona un archivo JSON válido.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            
            // Validación estructural mínima
            if (imported && Array.isArray(imported.transactions) && typeof imported.budgets === 'object' && Array.isArray(imported.goals)) {
                state = imported;
                saveState();
                closeModal('modal-import');
                document.getElementById('form-import').reset();
                
                // Reinicializar todo
                initAppViews();
                
                alert('Datos importados correctamente. La aplicación se ha actualizado.');
            } else {
                alert('El archivo no tiene el formato correcto para un respaldo de Verde.');
            }
        } catch (err) {
            alert('Error al leer el archivo JSON: ' + err.message);
        }
    };
    
    reader.readAsText(file);
}

// Reiniciar Datos
function handleResetData() {
    if (confirm('¿ATENCIÓN: Estás completamente seguro de borrar todos tus datos? Esta acción borrará todas las transacciones, metas y presupuestos actuales.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        loadState();
        initAppViews();
        alert('Los datos han sido restablecidos a los valores demo por defecto.');
    }
}

// ==========================================================================
// FUNCIONES DE FORMATEO
// ==========================================================================

// Formatear Moneda a USD/General
function formatCurrency(value) {
    return new Intl.NumberFormat('es-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Formatear Fecha
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    // Crear la fecha usando números locales para evitar problemas de huso horario
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Sanitizar Inputs
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
