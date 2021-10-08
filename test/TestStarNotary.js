const StarNotary = artifacts.require("StarNotary");
const truffleAssert = require('truffle-assertions');

var accounts;
var owner;
var starIndex;
contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
    starIndex = 0;
    console.log('accounts[0]:', accounts[0]);
    console.log('accounts[1]:', accounts[1]);
    console.log('accounts[2]:', accounts[2]);
    console.log('accounts[3]:', accounts[3]);
});

it('has name HeleneToken', async () => {
    let instance = await StarNotary.deployed();
    let actualName = await instance.name();
    assert.equal(actualName, 'HeleneToken');
});

it('has symbol HTC', async () => {
    let instance = await StarNotary.deployed();
    let actualSymbol = await instance.symbol();
    assert.equal(actualSymbol, 'HTC');
});

it('can Create a Star', async () => {
    let tokenId = ++starIndex;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = ++starIndex;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = ++starIndex;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = ++starIndex;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = ++starIndex;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

// TODO: rubric5: 1) The token name and token symbol are added properly.
it('can add the star name and star symbol properly', async () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
});

// DONE: rubric5: 2) 2 users can exchange their stars.
// 1. create 2 Stars with different tokenId
// 2. Call the exchangeStars functions implemented in the Smart Contract
// 3. Verify that the owners changed
it('lets 2 users exchange stars', async () => {
    let instance = await StarNotary.deployed();
    let starId1 = ++starIndex;
    let starId2 = ++starIndex;
    let user1 = accounts[1];
    let user2 = accounts[2];
    await instance.createStar('awesome star1', starId1, { from: user1 });
    await instance.createStar('awesome star2', starId2, { from: user2 });

    await instance.exchangeStars(starId1, starId2, { from: user1 });

    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);

    await instance.exchangeStars(starId2, starId1, { from: user1 });
    assert.equal(await instance.ownerOf(starId1), user1);
    assert.equal(await instance.ownerOf(starId2), user2);
});

it('lets 2 users exchange stars where 2nd parameter is msg sender', async () => {
    let instance = await StarNotary.deployed();
    let starId1 = ++starIndex;
    let starId2 = ++starIndex;
    let user1 = accounts[1];
    let user2 = accounts[2];
    await instance.createStar('awesome star1', starId1, { from: user1 });
    await instance.createStar('awesome star2', starId2, { from: user2 });

    await instance.exchangeStars(starId2, starId1, { from: user1 });
    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('error if sender is not owner of either star to exchange', async () => {
    // TODO: test: error if sender is not owner of either star to exchange
    let instance = await StarNotary.deployed();
    let starId1 = ++starIndex;
    let starId2 = ++starIndex;
    let user1 = accounts[1];
    let user2 = accounts[2];
    let user3 = accounts[3];
    await instance.createStar('awesome star1', starId1, { from: user1 });
    await instance.createStar('awesome star2', starId2, { from: user2 });

    await truffleAssert.reverts(instance.exchangeStars(starId2, starId1, { from: user3 }),
        'one of the parameters must contain a token owned by the request to exchange stars.');
});

// TODO: rubric5: 3) Stars Tokens can be transferred from one address to another.
it('lets a user transfer a star', async () => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
});

// TODO: rubric5: 4) bonus?
it('lookUptokenIdToStarInfo test', async () => {
    // 1. create a Star with different tokenId
    let tokenId = ++starIndex;
    let instance = await StarNotary.deployed();
    let expectedStarName = 'My Star!';
    await instance.createStar(expectedStarName, tokenId, { from: accounts[0] })
    // 2. Call your method lookUptokenIdToStarInfo
    let actualStarName = await instance.lookUptokenIdToStarInfo(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(actualStarName, expectedStarName);
});