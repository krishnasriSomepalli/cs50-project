import json
from random import *
# pick 20 random items from each category
# combine all this data
# shuffle the array
# divide the array into 5 files

random_data = []

all_categories = []
file = open("categories.txt", "r")
data = file.read();
i = 0;
j = 0;
category = ""
while i<len(data):
    if(data[i] == '\n'):
        all_categories.append(category)
        category = ""
        j = j+1
    else:
        category += data[i]
    i = i+1
file.close()

for category in all_categories:
    print(category+"...\n")
    with open('./files/json/' + category + '.json') as json_data:
        d = json.load(json_data)
        for j in range(0, 20):
            random_data.append(d[randint(0, len(d)-1)])
shuffle(random_data)

arr = []
temp = []
i = 0 # random_data[] index
for i in range(len(random_data)):
    if((i+1)%1725 == 0):
        arr.append(temp)
        temp = []
    temp.append(random_data[i])
arr.append(temp)

for i in range(5):
    j = i+1
    with open('./files/json/random'+str(j)+'.json', 'w') as outfile:
        json.dump(arr[i], outfile)

# pick a random integer: 1 to 5
# use that file for randomizing