const axios = require('axios').default;
const fs = require('fs');

const fetchStakers = async () => {
    const rawdata =  await axios.get('https://api.solpatrol.io/rest/staking/retreat/stakers-by-collection/bohemia_retreat') ;
    console.log(rawdata.data.data["BA2uae3sVeyFpcx7aMjmQQU9YaVh694PjWruUKGebeeE"]);

    const retreatingNFTS = [];
    for (const [key] of Object.entries(rawdata.data.data)) {
        const arrayOfNFTs = rawdata.data.data[key].nfts;
        arrayOfNFTs.forEach(NFT => {
            retreatingNFTS.push(NFT);   
       });
    }
    return retreatingNFTS;
}

const executeProgram = async () => {
    const retreatingNFTS = await fetchStakers();
    fs.writeFileSync('retreaters.json', JSON.stringify(retreatingNFTS));
    console.log(retreatingNFTS);

    const originalMintList = fs.readFileSync('hashlist-5000.json');
    const mintlist5000 = JSON.parse(originalMintList);
    
    const stakingList = [];
    mintlist5000.forEach(NFT => {
        const reward = retreatingNFTS.includes(NFT) ? 2 : 1;
        stakingList.push({
            mint: NFT, reward: reward
        });   
    });

    fs.writeFileSync('new-mintlist-5000.json', JSON.stringify(stakingList));
}

executeProgram();