const supabaseUrl = 'https://ajluevhlxphuysdofbja.supabase.co';
//MASKED KEY
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbHVldmhseHBodXlzZG9mYmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNzA3NDYsImV4cCI6MjAyNzY0Njc0Nn0.yzEfuQvIAgiM5oTahl9AlBizuUwTwX15ZhkoUkmTi0E';
const database = supabase.createClient(supabaseUrl, supabaseKey);

let save = document.querySelector("#save");
save.addEventListener("click", async (e) => {
    e.preventDefault();
    let name = document.querySelector("#name").value;
    let price = document.querySelector("#price").value; 
    let count = document.querySelector("#count").value; 
    let description = document.querySelector("#description").value; 
    let imageUrl = document.querySelector("#imageUrl").value; 
    save.innerText = "Saving....";
    save.disabled = true;
    let { data: res, error } = await database.from("instruments").insert([{
        name: name,
        price: price,
        count: count,
        description: description, 
        imageUrl: imageUrl 
    }]);
    
    if (!error) {
        alert("Instrument Added Successfully");
        // Clear inputs after successful save
        document.querySelector("#name").value = '';
        document.querySelector("#price").value = '';
        document.querySelector("#count").value = '';
        document.querySelector("#description").value = '';
        document.querySelector("#imageUrl").value = '';
        save.innerText = "Save";
        save.disabled = false;
        getInstruments();
    } else {
        console.error(error);
        alert("Instrument Not Added Successfully");
        save.innerText = "Save";
        save.disabled = false;
    }
});


const getInstruments = async () => {
    let tbody = document.getElementById("tbody");
    let loading = document.getElementById("loading");
    let tr = "";
    loading.innerText = "Loading....";
    const { data: instruments, error } = await database.from("instruments").select("*");
    if (instruments) {
        instruments.forEach((instrument, index) => {
            tr += `<tr>
                <td>${index + 1}</td>
                <td>${instrument.name}</td>
                <td>${instrument.price}</td>
                <td>${instrument.count}</td>
                <td>${instrument.description}</td>
                <td><img src="${instrument.imageUrl}" alt="${instrument.name}" style="width: 50px; height: auto;"></td>
                <td><button class="btn btn-primary" data-bs-toggle="modal"
                onclick='editInstrument(${instrument.id})' data-bs-target="#editModel">Edit</button></td>
                <td><button onclick='deleteInstrument(${instrument.id})' class="btn btn-danger">Delete</button></td>
            </tr>`;
        });
        tbody.innerHTML = tr;
        loading.innerText = "";
    } else if (error) {
        console.error('Error fetching instruments:', error);
        loading.innerText = "Failed to load instruments.";
    }
};

getInstruments();

const getTotalCount = async () => {
    let total = document.querySelector("#total");
    const { data: instruments, error, count } = await database.from("instruments").select("*", { count: "exact" });
    if (count !== undefined) {
        total.innerText = count;
    } else if (error) {
        console.error('Error getting total count:', error);
    }
};

getTotalCount();

const editInstrument = async (id) => {
    const { data: instrument, error } = await database.from("instruments").select("*").eq("id", id).single();
    if (instrument) {
        // Set values in the edit form inputs.
        console.log('Editing instrument with id:', instrument.id); // Log to check the id value
        document.getElementById("edit-id").value = instrument.id; // Assuming you have an input with id="edit-id"
        document.getElementById("edit-name").value = instrument.name;
        document.getElementById("edit-price").value = instrument.price;
        document.getElementById("edit-count").value = instrument.count;
        document.getElementById("edit-description").value = instrument.description;
        document.getElementById("edit-image-url").value = instrument.imageUrl;
    } else if (error) {
        console.error('Error fetching instrument for edit:', error);
    }
};

// When the update button is clicked, perform an update with the Supabase client.
const update = document.getElementById("update");
update.addEventListener("click", async () => {
    let id = document.getElementById("edit-id").value; // Make sure this is the correct id for your hidden input field
    console.log('Updating instrument with id:', id); // Log to check the id value
    let name = document.getElementById("edit-name").value;
    let price = document.getElementById("edit-price").value;
    let count = document.getElementById("edit-count").value;
    let description = document.getElementById("edit-description").value;
    let imageUrl = document.getElementById("edit-image-url").value;
    update.innerText = "Updating....";
    update.disabled = true;
    const { data: res, error } = await database.from("instruments").update({
        name, 
        price, 
        count, 
        description, 
        imageUrl  // Ensure this matches the capitalization in your database.
    }).eq("id", id);

    if (res) {
        alert("Instrument Updated Successfully");
        // Reset the form and UI after a successful update.
        document.getElementById("edit-id").value = '';
        document.getElementById("edit-name").value = '';
        document.getElementById("edit-price").value = '';
        document.getElementById("edit-count").value = '';
        document.getElementById("edit-description").value = '';
        document.getElementById("edit-image-url").value = '';
        update.innerText = "Update";
        update.disabled = false;
        getInstruments();
        // Close the modal if needed here.
    } else if (error) {
        console.error('Error updating instrument:', error);
        alert("Instrument Update Failed: " + error.message);
        update.innerText = "Update";
        update.disabled = false;
    }
});


const deleteInstrument = async (id) => {
    const { data: res, error } = await database.from("instruments").delete().eq("id", id);

    if (res) {
        alert("Instrument Deleted Successfully");
        getInstruments();
        getTotalCount();
    } else if (error) {
        console.error('Error deleting instrument:', error);
        alert("Instrument Not Deleted Successfully");
    }
};
