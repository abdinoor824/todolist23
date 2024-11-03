//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const { name } = require("ejs");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB3");

const itemsschema= {
  name:{
    type: String,
    required: true
  }
};
const Item = new mongoose.model("Item",itemsschema);
const item1 = new Item({
    name:"welcome to the todo list"
});
const item2 = new Item({
  name:"hit the + button to add new itemt"
});
const item3 = new Item({
  name:"---> hit this check box to delete"
});

const defaultItems = [item1,item2,item3];
 
const listSchema ={
  name: {
    type: String,
    required: true
  },
  items: [itemsschema]
}
 const List = mongoose.model("List",listSchema);


 app.get("/:customListName",function(req,res){
   const customListName = req.params.customListName;
   
    List.findOne({name:customListName})
    .then((saveditem,err)=>{
       if (!err){
        if(!saveditem){
         
        
          const list = new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
         }
         else{
          res.render("list", {listTitle: saveditem.name, newListItems: saveditem.items});
         }
        }
        
        
     

     })
    
    .catch((error) => {
      console.error("Error fetching items:", error); // Log any errors
    });

 }) ;


 

app.get("/", function(req, res) {



  Item.find({})

  .then((foundItems) => {


    if(foundItems.length===0){
     const insertItems = async () => {
  try {
    const result = await Item.insertMany(defaultItems);
    
    if (result.length > 0) {
      console.log("Successfully saved", result);
    } else {
      console.log("No items were saved.");
    }
  } catch (error) {
    console.log("An error occurred:", error);
  }
};

//Call the function
 insertItems();
 res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "today", newListItems: foundItems});//log item
    }
   
  })



  .catch((error) => {
    console.error("Error fetching items:", error); // Log any errors
  });



});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name:
     
    itemname,

  }); 

  if (listName==="today"){
    item.save();
    res.redirect("/"); 
  }else{
    List.findOne({name:listName})
    .then((foundlist,err)=>{
      foundlist.items.push(item);
       foundlist.save();
       res.redirect("/" + listName);
      }
    )
    
  .catch((error) => {
    console.error("Error fetching items:", error); // Log any errors
  });
    
  }
 


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });



// app.post("/delete",function(req,res){
//   const checkedItemId = req.body.checkbox;
//   Item.findByIdAndRemove(checkedItemId,function(err){
//     if(!err){
//       console.log("succsefully deleted");
//       res.redirect("/");
//     }
//   })
  
// }) 
const deleteItem = async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName ;
  if (listName==="today"){
    try {
      const result = await Item.findByIdAndDelete(checkedItemId);
      
      if (result) {
        console.log("Successfully deleted");
        res.redirect("/");
      } else {
        console.log("Item not found");
        res.status(404).send("Item not found");
      }
    } catch (error) {
      console.log("An error occurred:", error);
      res.status(500).send("An error occurred while deleting the item.");
    }
  }   else{
    List.findByIdAndDelete({name:listName},{$pull:{items:{_id:checkedItemId}}})
    .then((err,foundlist)=>{
       if(!err){
        res.redirect("/" + listName);
       }
    })
    .catch((error) => {
      console.error("Error fetching items:", error); // Log any errors
    });
  
  }
  
 
};

// Call this function in your route
app.post("/delete", deleteItem);


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
