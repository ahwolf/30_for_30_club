import json
import csv
import pprint

input_filename = "../../data/workout_data.csv"
us_states = "../../data/us_states.json"
output_filename = "../js/us_states.js"




with open(input_filename, "rU") as workout_infile,\
        open(us_states, "rU") as geo_json,\
        open(output_filename, "w") as output_file:

    state_json = json.load(geo_json)
    state_dict = {}
    
    # Initialize the variables for every state (and kenya) in the json
    for state_info in state_json["features"]:
        state_name = state_info['properties']['name']
        state_dict[state_name] = {'Miles run':0,
                                  'Miles biked':0,
                                  'Other workout hours':0,
                                  'Contributors':{},
                                  'name':state_name}


    # Go through the csv and add the appropriate info
    reader = csv.reader(workout_infile)
    for row in reader:
        # means there is a new name for the following workouts
        if row[0]:
            name = row[0]
        else:
            state = row[1]
            if row[2]:
                miles_run = float(row[2])
            else:
                miles_run = 0
            if row[3]:
                miles_bike = int(row[3])
            else:
                miles_bike = 0
            if row[4]:
                hours_other = float(row[4])
            else:
                hours_other = 0
        
            state_dict[state]['Miles run'] += miles_run
            state_dict[state]['Miles biked'] += miles_bike
            state_dict[state]['Other workout hours'] += hours_other
            state_dict[state]['Contributors'][name] = 1

    # Place the dictionary back into the original json
    for state_info in state_json['features']:
        state_name = state_info['properties']['name']
        state_info['properties'] = state_dict[state_name]
    json_output = json.dumps(state_json, output_file)
    output_file.write("var geography = " + json_output)


