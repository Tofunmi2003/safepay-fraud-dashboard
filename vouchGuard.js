




let brand = [
    {profile:
        {name:"Yamaha", visibilityScore: 40, 
            issues: ["Schema", "Links", "Sentiment", "Crawl"], status: "Critical"}
        }, 
        {profile:
            {name:"Honda", visibilityScore: 80, 
                issues: ["Schema", "Links", "Sentiment", "Crawl"], status: "Healthy"}
                            }, 
      {profile:
        {name:"Toyota", visibilityScore: 20, 
            issues: ["Schema", "Links",  "Crawl"], status: "Critical"}       
      },
        {profile:
            {name:"Ford", visibilityScore: 60, 
                issues: ["Schema",  "Sentiment", "Crawl"], status: "Healthy"}
        },
        {profile:
            {name:"Chevrolet", visibilityScore: 90, 
                issues: [ "Sentiment", "Crawl"], status: "Healthy"}
        }, 
        {profile:
            {name:"Nissan", visibilityScore: 30, 
                issues: ["Schema", "Links" ], status: "Critical"}}
         
];
   
    async function startVouchAudit(){
         console.log("🚀 Initializing AI Visibility Audit...");
    
try{
     await new Promise((resolve) => setTimeout(resolve, 2000));
     console.log("✅ Scan Complete. Processing Data...\n");

     const emergencies = brand.filter((client) => {
    return client?.profile?.visibilityScore < 50 && client?.profile?.issues.length > 2;
});
console.log(emergencies);


brand.forEach((client) => {
    if (client?.profile?.visibilityScore < 50 && client?.profile?.issues.length > 2) {
        console.log(` ${client?.profile?.name} status is CRITICAL with a visibility 
            score of ${client?.profile?.visibilityScore} and ${client?.profile?.issues.length} issues.`);
    };
});
 const generateReport = brand.map((client) =>{
    return {
        name: client?.profile?.name,
        visibilityScore: client?.profile?.visibilityScore,
        issues: client?.profile?.issues.length
    }
});


console.log("\n--- FINAL SYSTEM REPORT ---");
        console.table(generateReport);

}catch (error) {
    console.log("An error occurred:", error.message);
}
    } 

    startVouchAudit();



 
 

