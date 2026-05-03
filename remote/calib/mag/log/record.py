import csv
import time
import serial
import numpy as np
import matplotlib.pyplot as plt


SER_PORT = '/dev/cu.usbmodem142301'
SER_BAUD = 115200
SAMPLE_FREQ = 10  # Frequency to record magnetometer readings at [Hz]
T_SAMPLE = 60  # Total time to read mangetometer readings [sec]
OUTPUT_FILENAME = 'magdata.txt'  # Output data file name


class SerialPort:
	def __init__(self, port, baud=115200):
		if isinstance(port, str) == False:
			raise TypeError('port must be a string.')

		if isinstance(baud, int) == False:
			raise TypeError('Baud rate must be an integer.')

		self.port = port
		self.baud = baud

		self.ser = serial.Serial(self.port, self.baud, timeout=1)
		self.ser.flushInput()
		self.ser.flushOutput()
	

	def Read(self, clean_end=True):
		bytesToRead = self.ser.readline()
		decodedMsg = bytesToRead.decode('utf-8')

		if clean_end == True:
			decodedMsg = decodedMsg.strip('\r').strip('\n')  # Strip extra chars at the end
		
		return decodedMsg
	

	def Write(self, msg):
		try:
			self.ser.write(msg.encode())
			return True
		except:
			print("Error sending message.")
	

	def Close(self):
		"""Close serial connection."""
		self.ser.close()


class PlotPoints3D:
	def __init__(self, fig, ax, live_plot=True, marker='o', c='r'):
		self.fig = fig  # fig and axes
		self.ax = ax
		self.live_plot = live_plot
		self.ptMarker = marker  # Point symbol
		self.ptColor = c  # Point color
		self.edgeColor = 'k'  # Border/edge of point
		self.ax.set_xlim((-80, 80))  # Set axes limits to keep plot shape
		self.ax.set_ylim((-80, 80))
		self.ax.set_zlim((-80, 80))
	

	def AddPoint(self, x, y, z):
		self.ax.scatter(x, y, z, marker=self.ptMarker, 
			c=self.ptColor, edgecolors=self.edgeColor)
		
		if self.live_plot == True:
			plt.pause(0.001)


Arduino = SerialPort(SER_PORT, SER_BAUD)
N = int(SAMPLE_FREQ * T_SAMPLE)  # Number of readings
DT = 1.0 / SAMPLE_FREQ  # Sample period [sec]


# Create live plot for logging points
fig_rawReadings = plt.figure()
ax_rawReadings = fig_rawReadings.add_subplot(111, projection='3d')
RawDataPlot = PlotPoints3D(fig_rawReadings, ax_rawReadings, live_plot=False)


# Take a few readings to 'flush' out bad ones
for _ in range(4):
	data = Arduino.Read().split(',')  # Split into separate values
	time.sleep(0.25)


measurements = np.zeros((N, 3), dtype='float')

for currMeas in range(N):
	data = Arduino.Read().split(',')  # Split into separate values

	mx, my, mz = float(data[0]), float(data[1]), float(data[2])  # Convert to floats, [uT]
	
	print('[%0.4f, %0.4f, %0.4f] uT  |  Norm: %0.4f uT  |  %0.1f %% Complete.' % 
		(mx, my, mz, np.sqrt(mx**2 + my**2 + mz**2), (currMeas / N) * 100.0)
	)

	# Store data to array
	measurements[currMeas, 0] = mx
	measurements[currMeas, 1] = my
	measurements[currMeas, 2] = mz
	
	RawDataPlot.AddPoint(mx, my, mz)  # Add point to 3D plot


# After measurements are complete, write data to file
Arduino.Close()
print('Sensor Reading Complete!')

print('Writing data to {} ...'.format(OUTPUT_FILENAME))
with open(OUTPUT_FILENAME, 'w', newline='') as f:
	writer = csv.writer(f, delimiter='\t')
	for i in range(N):
		writer.writerow([measurements[i, 0], measurements[i, 1], measurements[i, 2]])

plt.show()
