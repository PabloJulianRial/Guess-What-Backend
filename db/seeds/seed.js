const mongoose = require("mongoose");
const Alien = require("./schemata/Alien");
const Question = require("./schemata/Question");
const User = require("./schemata/User")
const connectDB = require("../connectMongo");

connectDB();

async function seed(attributes, questions, testUsers) {
  await mongoose.connection.collection("aliens").deleteMany({});
  await mongoose.connection.collection("questions").deleteMany({});
  await mongoose.connection.collection("users").deleteMany({});

  async function seedAliens(attributes, currentCombination = {}) {
    const attributeKeys = Object.keys(attributes);

    if (attributeKeys.length === 0) {
      const alien = new Alien(currentCombination);
      await alien.save();
      return;
    }

    const attributeKey = attributeKeys[0];
    const attributeValues = attributes[attributeKey];

    for (const value of attributeValues) {
      const newCombination = { ...currentCombination, [attributeKey]: value };
      const remainingAttributes = { ...attributes };
      delete remainingAttributes[attributeKey];
      seedAliens(remainingAttributes, newCombination);
    }
  }
  await seedAliens(attributes);

  async function seedQuestions(attributes, questions) {
    for (const attribute in attributes) {
      if (attribute === "isActive") break;
      attributes[attribute].forEach(async (variation) => {
        const questionObj = {
          alienProp: attribute,
          checkFor: variation,
          question: questions[attribute][variation] + "?"
        };
        const question = new Question(questionObj);
        await question.save();
      });
    }
  }
  await seedQuestions(attributes, questions);

  async function seedTestUsers(testUsers) {
    testUsers.forEach(async (testUser) => {
      const userObj = {
        username: testUser.username,
        score: testUser.score,
        time: {
          minutes: testUser.minutes,
          seconds: testUser.seconds
        }
      }
      {testUser.created_at ? userObj.created_at = testUser.created_at : null}
      const user = new User(userObj)
      await user.save()
    })
  }
  await seedTestUsers(testUsers)

  console.log("Data seeded successfully");
  // await mongoose.connection.close();
}
module.exports = seed;
