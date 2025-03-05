class Helper:

    def displayAllFormData(self, request):
        form_data = request.form.to_dict()

        # Iterate through the form data and display each field
        for field_name, field_value in form_data.items():
            print(f"{field_name}: {field_value}")
    
  # def save_json_to_file(self):
   #    with open('data.json', 'w') as outfile:
     #      json.dump(data, outfile)