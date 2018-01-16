import nltk

input_file = open("large", "r")
data = input_file.read()
input_file.close()

words = nltk.word_tokenize(data)
tagged = nltk.pos_tag(words)
filtered = ""

for word, pos in tagged:
    if( pos == "NN" or pos == "NNP" or pos == "NNS" or pos == "NNPS"):
        filtered = filtered + word + '\n'

output_file = open("nouns", "w")
output_file.write(filtered)
output_file.close()