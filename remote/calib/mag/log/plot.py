import numpy as np
import matplotlib.pyplot as plt


# Define calibration parameters
b = np.array([-16.206860, 68.225762, -128.966136])
A = np.array([
	[1.170539, -0.016936, -0.015678],
	[-0.016936, 1.109033, 0.007859],
	[-0.015678, 0.007859, 0.997975]
])


# Read raw data and apply calibration
rawData = np.genfromtxt('magdata.txt', delimiter='\t')  # Read raw measurements

N = len(rawData)
calibData = np.zeros((N, 3), dtype='float')
for i in range(N):
	currMeas = np.array([rawData[i, 0], rawData[i, 1], rawData[i, 2]])
	calibData[i, :] = A @ (currMeas - b)


# Plot XY data
plt.figure()
plt.plot(rawData[:, 0], rawData[:, 1], 'b*', label='Raw Meas.')
plt.plot(calibData[:, 0], calibData[:, 1], 'r*', label='Calibrated Meas.')
plt.title('XY Magnetometer Data')
plt.xlabel('X [uT]')
plt.ylabel('Y [uT]')
plt.legend()
plt.grid()
plt.axis('equal')

# Plot YZ data
plt.figure()
plt.plot(rawData[:, 1], rawData[:, 2], 'b*', label='Raw Meas.')
plt.plot(calibData[:, 1], calibData[:, 2], 'r*', label='Calibrated Meas.')
plt.title('YZ Magnetometer Data')
plt.xlabel('Y [uT]')
plt.ylabel('Z [uT]')
plt.legend()
plt.grid()
plt.axis('equal')

# Plot XZ data
plt.figure()
plt.plot(rawData[:, 0], rawData[:, 2], 'b*', label='Raw Meas.')
plt.plot(calibData[:, 0], calibData[:, 2], 'r*', label='Calibrated Meas.')
plt.title('XZ Magnetometer Data')
plt.xlabel('X [uT]')
plt.ylabel('Z [uT]')
plt.legend()
plt.grid()
plt.axis('equal')


# Plot 3D scatter
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

for i in range(N):
	xraw = rawData[i, 0]
	yraw = rawData[i, 1]
	zraw = rawData[i, 2]

	xcalib = calibData[i, 0]
	ycalib = calibData[i, 1]
	zcalib = calibData[i, 2]
	ax.scatter(xraw, yraw, zraw, color='r')
	ax.scatter(xcalib, ycalib, zcalib, color='b')

ax.set_title('3D Scatter Plot of Magnetometer Data')
ax.set_xlabel('X [uT]')
ax.set_ylabel('Y [uT]')
ax.set_zlabel('Z [uT]')


plt.show()
