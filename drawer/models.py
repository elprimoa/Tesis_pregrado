from django.db import models

# Create your models here.

class Counter(models.Model):
	cnt = models.IntegerField(default = 0)
	def __str__(self):
		return str(self.cnt)

class Genetic(models.Model):
	sid = models.IntegerField(default = 0)
	gencount = models.IntegerField(default = 0)
	minf = models.FloatField(default = 0)
	cancel = models.BooleanField(default = False)
	def __str__(self):
		return str(self.sid)