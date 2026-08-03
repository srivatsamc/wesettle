// ==========================
// WeSettle - script.js
// Part 1/3
// ==========================

const members = [
    "Srivatsa",
    "Vinayaka",
    "Akash",
    "Rakesh",
    "Bharath",
    "Chethan"
];


let expenses =
    JSON.parse(
        localStorage.getItem("wesettle_expenses")
    ) || [];


// DOM Elements

const paidBy = document.getElementById("paidBy");

const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseDate = document.getElementById("expenseDate");

const saveExpenseBtn = document.getElementById("saveExpenseBtn");

const memberList = document.getElementById("memberList");
const splitMembers = document.getElementById("splitMembers");

const expenseList = document.getElementById("expenseList");
const settlementList = document.getElementById("settlementList");

const totalExpense = document.getElementById("totalExpense");
const memberCount = document.getElementById("memberCount");
const currentMonth = document.getElementById("currentMonth");


// Default date

expenseDate.value =
    new Date()
    .toISOString()
    .split("T")[0];


// Current month

currentMonth.innerText =
    new Date()
    .toLocaleString(
        "default",
        {
            month:"long",
            year:"numeric"
        }
    );


// Save expenses only

function saveData(){

    localStorage.setItem(
        "wesettle_expenses",
        JSON.stringify(expenses)
    );

}


// --------------------------
// Render Members
// --------------------------

function renderMembers(){

    memberList.innerHTML="";

    paidBy.innerHTML =
        `<option value="">Paid By</option>`;


    members.forEach(member=>{


        memberList.innerHTML += `

            <div class="member-chip">
                👤 ${member}
            </div>

        `;


        paidBy.innerHTML += `

            <option value="${member}">
                ${member}
            </option>

        `;


    });


    memberCount.innerText =
        members.length;

}



// --------------------------
// Render Split Members
// --------------------------

function renderSplitMembers(){

    splitMembers.innerHTML="";


    members.forEach(member=>{


        splitMembers.innerHTML += `

        <label class="member-chip">

            <input
                type="checkbox"
                class="splitCheck"
                value="${member}">

            ${member}

        </label>

        `;


    });

}



// --------------------------
// Add Expense
// --------------------------

saveExpenseBtn.addEventListener(
"click",
()=>{


    const title =
        expenseTitle.value.trim();


    const amount =
        Number(expenseAmount.value);


    const payer =
        paidBy.value;


    const date =
        expenseDate.value;



    if(
        title === "" ||
        amount <= 0 ||
        payer === ""
    ){

        alert("Fill all expense details");

        return;

    }



    const participants =
        Array.from(
            document.querySelectorAll(
                ".splitCheck:checked"
            )
        )
        .map(
            checkbox=>checkbox.value
        );



    if(participants.length===0){

        alert(
            "Select members for split"
        );

        return;

    }



    expenses.push({

        title,
        amount,
        payer,
        date,
        participants

    });



    saveData();


    expenseTitle.value="";
    expenseAmount.value="";
    paidBy.value="";

    expenseDate.value =
        new Date()
        .toISOString()
        .split("T")[0];


    // Clear selected split members
    document
    .querySelectorAll(".splitCheck")
    .forEach(checkbox => {
        checkbox.checked = false;
    });

    renderExpenses();

    calculateSettlement();


});

// ==========================
// WeSettle - script.js
// Part 2/3
// ==========================


// --------------------------
// Render Expenses
// --------------------------

function renderExpenses(){

    expenseList.innerHTML="";


    if(expenses.length === 0){

        expenseList.innerHTML = `

            <div class="empty">
                No expenses added yet.
            </div>

        `;

        totalExpense.innerText = "₹0";

        return;

    }



    let total = 0;



    expenses.forEach(
    (expense,index)=>{


        total += expense.amount;



        const card =
        document.createElement("div");


        card.className =
            "expense-card";



        card.innerHTML = `

            <div>

                <h3>
                    ${expense.title}
                </h3>


                <p>
                    Paid by ${expense.payer}
                </p>


                <p>
                    Split between:
                    ${expense.participants.join(", ")}
                </p>


                <p>
                    ${formatDate(expense.date)}
                </p>

            </div>


            <div>

                <div class="expense-amount">

                    ₹${expense.amount.toLocaleString("en-IN")}

                </div>


                <button
                    onclick="deleteExpense(${index})"
                    style="
                    color:red;
                    margin-top:5px;
                    cursor:pointer;
                    "
                >

                    Delete

                </button>


            </div>

        `;



        expenseList.appendChild(card);


    });



    totalExpense.innerText =
        "₹" + total.toLocaleString("en-IN");


}




// --------------------------
// Delete Expense
// --------------------------

function deleteExpense(index){


    if(
        !confirm(
            "Delete this expense?"
        )
    ){

        return;

    }



    expenses.splice(
        index,
        1
    );



    saveData();


    renderExpenses();


    calculateSettlement();


}





// --------------------------
// Date Formatter
// --------------------------

function formatDate(date){


    if(!date)
        return "";



    return new Date(date)
    .toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );


}





// --------------------------
// Settlement Calculation
// --------------------------

function calculateSettlement(){


    settlementList.innerHTML="";



    if(
        expenses.length===0
    ){

        settlementList.innerHTML = `

            <div class="empty">

                No settlements available.

            </div>

        `;

        return;

    }




    let balances = {};



    // Initialize balances

    members.forEach(member=>{

        balances[member]=0;

    });





    expenses.forEach(expense=>{


        const share =
            expense.amount /
            expense.participants.length;



        // Payer gets money back

        balances[expense.payer]
        += expense.amount;



        // Participants owe their share

        expense.participants.forEach(member=>{


            balances[member]
            -= share;


        });



    });





    const creditors = [];

    const debtors = [];





    Object.keys(balances)
    .forEach(member=>{


        const amount =
            Number(
                balances[member]
                .toFixed(2)
            );



        if(amount > 0){


            creditors.push({

                name: member,
                amount

            });


        }
        else if(amount < 0){


            debtors.push({

                name: member,
                amount:
                    Math.abs(amount)

            });


        }



    });





    let output = "";





    debtors.forEach(debtor=>{


        creditors.forEach(creditor=>{


            if(
                debtor.amount <= 0 ||
                creditor.amount <= 0
            ){

                return;

            }




            const payment =
                Math.min(
                    debtor.amount,
                    creditor.amount
                );





            output += `


            <div class="settlement-card">


                ${debtor.name}

                owes

                ${creditor.name}


                <strong>

                    ₹${payment.toLocaleString("en-IN")}

                </strong>


            </div>


            `;





            debtor.amount -= payment;

            creditor.amount -= payment;



        });



    });





    if(output===""){


        output = `

            <div class="settlement-card">

                All settled 🎉

            </div>

        `;


    }




    settlementList.innerHTML =
        output;


}

// ==========================
// WeSettle - script.js
// Part 3/3
// ==========================


// --------------------------
// Refresh Application
// --------------------------

function refreshApp(){

    renderMembers();

    renderSplitMembers();

    renderExpenses();

    calculateSettlement();

}




// --------------------------
// Enter Key Support
// --------------------------

if(expenseAmount){

    expenseAmount.addEventListener(
        "keypress",
        function(event){

            if(event.key === "Enter"){

                saveExpenseBtn.click();

            }

        }
    );

}




// --------------------------
// Sync Across Browser Tabs
// --------------------------

window.addEventListener(
    "storage",
    function(event){


        if(
            event.key === "wesettle_expenses"
        ){


            expenses =
            JSON.parse(
                localStorage.getItem(
                    "wesettle_expenses"
                )
            ) || [];



            refreshApp();


        }


    }
);




// --------------------------
// Start Application
// --------------------------

refreshApp();