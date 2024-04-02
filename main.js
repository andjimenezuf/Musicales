let instruments = []; // This will hold your instruments data
let shoppingCart = []; // This will track items in the cart

// Supabase client initialization
const supabaseUrl = 'https://ajluevhlxphuysdofbja.supabase.co';
//MASEKED KEY
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbHVldmhseHBodXlzZG9mYmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNzA3NDYsImV4cCI6MjAyNzY0Njc0Nn0.yzEfuQvIAgiM5oTahl9AlBizuUwTwX15ZhkoUkmTi0E';
const database = supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch instruments from the database and display them
const fetchAndShowInstruments = async () => {
    const instrumentListDiv = document.getElementById("instrumentList");
    if (!instrumentListDiv) {
        console.error('Instrument list div not found!');
        return;
    }

    instrumentListDiv.innerText = "Loading....";
    
    const { data, error } = await database.from("instruments").select("*");

    if (error) {
        console.error('Error fetching instruments:', error);
        instrumentListDiv.innerText = "Failed to load instruments.";
    } else {
        // Assign fetched instruments to the global variable
        instruments = data;
        // Generate HTML for each instrument and display it
        instrumentListDiv.innerHTML = instruments.map(instrument => {
            return `
                <div id="product-id-${instrument.id}" class="item">
                    <img width="245" height="60%" src="${instrument.imageUrl}" alt="${instrument.name}">
                    <div class="details">
                        <h3>${instrument.name}</h3>
                        <p>${instrument.description}</p>
                        <div class="price-qty">
                            <h2>$${instrument.price}</h2>
                            <div class="buttons">
                                <i onclick="removeItem('${instrument.id}')" class="bi bi-dash-square"></i>
                                <div id="qty-${instrument.id}" class="qty">0</div>
                                <i onclick="addItem('${instrument.id}')" class="bi bi-plus-square"></i>
                            </div>
                        </div>
                    </div>   
                </div>
            `;
        }).join('');
        updateCartTotal(); // Call to update cart total after instruments are fetched
    }
};

// Call fetchAndShowInstruments on page load
fetchAndShowInstruments();

const addAllItemsInCart = () => {
    let totalQty = 0; // Initialize total quantity

    // Sum up the quantity of all items in the shopping cart
    shoppingCart.forEach(item => {
        totalQty += item.qty;
    });

    // Update the cart icon's quantity display
    document.getElementById("totalCartQty").textContent = totalQty;
};
// Function to add an item to the shopping cart
let addItem = (id) => {
    let found = shoppingCart.find(item => item.id === id);
    if (!found) {
        shoppingCart.push({ id, qty: 1 });
    } else {
        found.qty += 1;
    }
    updateItem(id);
    updateCartTotal();
    addAllItemsInCart(); // Update total quantity
};

// Function to remove an item from the shopping cart
let removeItem = (id) => {
    let found = shoppingCart.find(item => item.id === id);
    if (found && found.qty > 0) {
        found.qty -= 1;
    }
    updateItem(id);
    updateCartTotal();
    addAllItemsInCart(); // Update total quantity
};

// Function to update the displayed quantity for an item
let updateItem = (id) => {
    const qtyDiv = document.getElementById(`qty-${id}`);
    if (qtyDiv) {
        let found = shoppingCart.find(item => item.id === id);
        qtyDiv.textContent = found ? found.qty : 0;
    }
};

// Function to calculate and update the cart total value
const updateCartTotal = () => {
    let totalValue = 0;
    let cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = ''; // Clear current cart items

    shoppingCart.forEach(item => {
        let foundInstrument = instruments.find(instrument => instrument.id === item.id);
        if (foundInstrument) {
            let itemTotal = item.qty * foundInstrument.price;
            totalValue += itemTotal;
            cartItemsDiv.innerHTML += `<p>${foundInstrument.name} x ${item.qty} = $${itemTotal.toFixed(2)}</p>`;
        }
    });

    document.getElementById('cartTotalValue').innerText = totalValue.toFixed(2);
};

// DOM-related functions
function toggleCart() {
    let modal = document.getElementById('cartModal');
    modal.style.display = modal.style.display === "none" || modal.style.display === "" ? "block" : "none";
    updateCartTotal();
}

function closeCart() {
    document.getElementById('cartModal').style.display = "none";
}
