//jshint esversion:6

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const https = require('https');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');
require('dotenv').config();


const date = require(__dirname + "/date.js");



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


//CODE......................................................

const User_password=process.env.USER_PASSWORD;
const connectionUrl="mongodb+srv://admin-pulkit:"+User_password+"@cluster0.5lgqq.mongodb.net/todoListDB";

mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Item Schema and Model
const itemSchema = {
    name: String
};
const Item = mongoose.model("Item", itemSchema);

//List Schema and Model
const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


//Default Items
const item1 = new Item({
    name: "Eat"
});
const item2 = new Item({
    name: "Sleep"
});
const item3 = new Item({
    name: "Code"
});
const defaultItems = [item1, item2, item3];



app.get("/", function (req, res) {
    // let today = date.getDate();

    Item.find({}, function (err, itemsArray) {

        if (itemsArray.length === 0) {
            Item.insertMany(defaultItems, function (err, docs) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Inserted 3 rows");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                tasksToDo: itemsArray
            });
        }
    });
});

app.post("/", function (req, res) {

    const listType = req.body.listType;
    const newItem = new Item({
        name: req.body.nextTask
    });

    if (listType === "Today") {
        // Root("/") List 
        newItem.save();
        res.redirect("/");
    } else {
        //Any Other List
        List.findOne({
            name: listType
        }, function (err, result) {

            // console.log(result);
            result.items.push(newItem);
            result.save();
            res.redirect("/" + listType);
        })
    }

});

app.post("/delete", function (req, res) {

    let id = req.body.checkbox;
    let listType = req.body.listType;
    console.log(id);
    console.log(listType);

    if (listType === "Today") {
        //Root List
        Item.findByIdAndRemove(id, function (err) {
            if (!err) {
                console.log("delete One Item");
                res.redirect("/");
            }
        });
    } else {
        //Custom List
        List.findOneAndUpdate({
            name: listType
        }, {
            $pull: {
                items: {
                    _id: id
                }
            }
        }, function (err, result) {
            if (!err) {
                res.redirect("/" + listType);
            }
        });
    }
});


//Custom List Routes Setup
app.get("/:listType", function (req, res) {

    let newListName = _.capitalize(req.params.listType);
    List.findOne({
        name: newListName
    }, function (err, result) {
        if (!err) {
            if (!result) {

                //making a New List if it doesn't Already Exist
                const list = new List({
                    name: newListName,
                    items: defaultItems
                });
                list.save();
                setTimeout(function(){ res.redirect("/" + newListName); }, 100);
                
            } else {

                //List Found
                res.render("list", {
                    listTitle: newListName,
                    tasksToDo: result.items
                });
            }
        }
    });

});

app.get("/about", function (req, res) {
    res.render("About");

});

//SERVER 
app.listen(3000, function () {
    console.log("Server started on port 3000");
});