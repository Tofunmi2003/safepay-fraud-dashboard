/*let transactions = [

    {profile: {id: 1, customer:"alice", amount: 100, location: "New York", isInternational: true}},
    {profile: {id: 2, customer:"bob", amount: 200, location: "Lagos", isInternational: false}},
    {profile: {id: 3, customer:"charlie", amount: 150, location: "Tokyo", isInternational: true}},
    {profile: {id: 4, customer:"diana", amount: 300, location: "London", isInternational: true}},
    {profile: {id: 5, customer:"eve", amount: 50, location: "Ondo", isInternational: false}}
]

 try{
    const fraudAlert = transactions.filter((transaction) => {
        return transaction?.profile?.isInternational === true && transaction?.profile?.amount > 250;
      })

console.log(fraudAlert);

transactions.forEach((transaction) => {
    if (transaction?.profile?.isInternational === true
     ) {
        console.log(`Transaction ${transaction?.profile?.id} by 
            ${transaction?.profile?.customer} is flagged as INTERNATIONAL transaction
            ${transaction?.profile?.amount}.`);
    }
})


 const generateReport = transactions.map((transaction) => {
    return {
        id: transaction?.profile?.id,
        customer: transaction?.profile?.customer,
        amount: transaction?.profile?.amount
    }  
});  

console.log(generateReport);
 }
    catch(error){
        console.error("An error occurred:", error);
    }*/

       // safePay.js

// We pass 'data' as an argument so this function can check 
// ANY transactions we give it (from an array OR a database).
export const runFraudDetection = (data) => {
    return data.filter((transaction) => {
        // IMPORTANT: Check your MySQL column names! 
        // If your DB uses 'isInternational', change 'is_international' below.
        return transaction.is_international === 1 && transaction.amount > 250; 
    });
};  