// Tasas de cambio fijas relativas al USD
// En producción esto vendría de una API externa (e.g. exchangerate-api.com)
const EXCHANGE_RATES = {
    USD: 1,
    GTQ: 7.75,     // Quetzal guatemalteco
    EUR: 0.92,
    MXN: 17.15,
    HNL: 24.70,    // Lempira hondureño
    CRC: 510.00    // Colón costarricense
};

const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES);

// =====================================================
// GET /currencies — lista de monedas y tasas vs USD
// =====================================================
export const getRates = (req, res) => {
    res.json({
        success: true,
        base: "USD",
        rates: EXCHANGE_RATES,
        updatedAt: new Date().toISOString()
    });
};

// =====================================================
// POST /currencies/convert
// Body: { amount, from, to }
// =====================================================
export const convertCurrency = (req, res) => {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
        return res.status(400).json({ message: "amount, from y to son obligatorios" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "El monto debe ser mayor a 0" });
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency   = to.toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(fromCurrency)) {
        return res.status(400).json({ message: `Moneda origen no soportada: ${fromCurrency}`, supported: SUPPORTED_CURRENCIES });
    }
    if (!SUPPORTED_CURRENCIES.includes(toCurrency)) {
        return res.status(400).json({ message: `Moneda destino no soportada: ${toCurrency}`, supported: SUPPORTED_CURRENCIES });
    }

    // Convertir: from → USD → to
    const amountInUSD  = parsedAmount / EXCHANGE_RATES[fromCurrency];
    const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];

    res.json({
        success: true,
        original: { amount: parsedAmount, currency: fromCurrency },
        converted: {
            amount: Math.round(convertedAmount * 100) / 100,  // 2 decimales
            currency: toCurrency
        },
        rate: EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]
    });
};