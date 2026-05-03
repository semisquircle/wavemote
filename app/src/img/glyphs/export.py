import fontforge
import os
import shutil
import re
import psMat
import json


FONTS = {
	"eng": "NotoSans",
	"gre": "NotoSans",
	"heb": "NotoSansHebrew",
	"jpn": "NotoSansJP"
}


def export(lang):
	output_dir = lang

	# Empty and remake output directory
	if os.path.exists(output_dir):
		shutil.rmtree(output_dir)
	os.makedirs(output_dir)


	# Define FontForge font file
	font = fontforge.open(f"../../font/{FONTS[lang]}/sfd/{FONTS[lang]}-Light.sfd")


	# Populate character list based on keyboard array
	chars = []

	def extract_chars(nested_list):
		for item in nested_list:
			if isinstance(item, list):
				extract_chars(item)
			else:
				if ord(item) != 9251 and ord(item) != 9003 and ord(item) != 32:
					chars.append(ord(item))
	
	with open("../../keyboards.json") as f:
		keyboardList = json.load(f)
		kHoriz = []

		for kLang in keyboardList:
			if kLang["iso"] == lang:
				kHoriz = kLang["orients"][0]["chars"]
				break
		
		extract_chars(kHoriz)


	# Convert characters to SVGs
	for char in chars:
		glyph = font[char]
		# glyph.build()

		svg_path = os.path.join(output_dir, f"{char}.svg")
		
		glyph.left_side_bearing = 0
		glyph.right_side_bearing = 0

		glyph.width = 1000
		x_min, y_min, x_max, y_max = glyph.boundingBox()

		translationX = (1000 - (x_max - x_min)) / 2
		translationY = (font.ascent - font.descent - (y_min + y_max)) / 2
		glyph.transform(psMat.translate(translationX, translationY))

		glyph.export(svg_path)


		# Modify viewbox
		with open(svg_path, "r") as svg_file:
			svg_content = svg_file.read()

		start_string = 'viewBox="'
		end_string = '">'
		new_viewbox = f'viewBox="0 0 1000 1000">'
		svg_content = re.sub(f'{start_string}.*?{end_string}', new_viewbox, svg_content, flags=re.DOTALL)
		svg_content = re.sub('fill="currentColor"', "", svg_content, flags=re.DOTALL)

		with open(svg_path, "w") as svg_file:
			svg_file.write(svg_content)


		# Remove first two lines
		with open(svg_path, "r") as fin:
			data = fin.read().splitlines(True)
		with open(svg_path, "w") as fout:
			fout.writelines(data[2:])

	print(f"Exported {len(chars)} characters.")


if __name__ == "__main__":
	# export("eng")
	# export("gre")
	# export("heb")
	export("jpn")
