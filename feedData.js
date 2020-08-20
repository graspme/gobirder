exports.copyMediaFiles = function (file, dir, fs) {
	if (file)
	{
		var len = 1;
		if (file.length)
			len = file.length;
		for (var i = 0; i < len; i++)
		{
			var sampleFile = len==1?file:file[i];
			var phDir = dir;
			!fs.existsSync(phDir) && fs.mkdirSync(phDir);
			console.log("Final path: "+phDir+sampleFile.name);

			sampleFile.mv(phDir+sampleFile.name, function(err) {
			if (err)
			  console.log ("error in "+sampleFile.name);
			});
		}
	}
};

exports.insertData = function (req, res, con, mediaDir) {
	var name = req.body.Name;
	var sciName = req.body.SciName;
	var classification = req.body.Classification;
	var behaviour = 0;
	for (var i = 0; i < req.body.Behaviour.length; i++ )
		behaviour += parseInt(req.body.Behaviour[i], 10);
	var plumage = 0;
	for (var i = 0; i < req.body.Plumage.length; i++ )
		plumage += parseInt(req.body.Plumage[i], 10);
	var size = req.body.Size;
	var desc = req.body.Description;

	//first check if record exists
	var query_stmt = "select * from X_birds where ScientificName='"+sciName+"'";
	var insert_stmt = "";
	con.query(query_stmt, function (err, result, fields) 
	{
		if (err)
			throw err;
		if (result.length == 0)//entry is absent
		{
				var len = 0;
				var pictures = "";

				if (req.files.Photo.length)
				{
					len = req.files.Photo.length;
					for (var i = 0; i < len; i++)
					{
						var photo = len==1?req.files.Photo:req.files.Photo[i];
						var info = len==1?req.body.Info:req.body.Info[i];
						pictures += mediaDir+"Photos/"+photo.name+"|"+info+",";
					}
					console.log("\n Pictures column: " +pictures);
				}

				var sounds = "";
				if (req.files.Sounds) 
				{    				
					console.log("req.files.Sounds:" + req.files.Sounds);
					var snd ="";
					
					if (req.files.Sounds.length > 0)
					{
					 console.log("req.files.Sounds.length:" + req.files.Sounds.length);
					 len = req.files.Sounds.length;
					  for (var i = 0; i < len; i++)
					    {
						snd = len==1?req.files.Sounds:req.files.Sounds[i];
						sounds += mediaDir+"Sounds/"+snd.name+",";
						}
					}
					else
						{
						snd = req.files.Sounds.name;
						sounds += mediaDir+"Sounds/"+snd;
						}
						
					console.log("\n Sounds Column: " +sounds);
				}

				
				var map = "";
				if (req.files.Map)
				{
					map = mediaDir+"Map/"+req.files.Map;
				}

				/*Inserting rows in x_birds*/


				//insert_stmt = "insert into X_birds (CommonName, ScientificName, Classification, Behaviour, Plumage, Size) values (quote('"+name+"'),'"+sciName+"','"+classification+"',"+behaviour+","+plumage+","+size+")"; 
				var	escaped_name = name.replace(/'/g,"\\'");
				insert_stmt = "insert into X_birds (CommonName, ScientificName, Classification, Behaviour, Plumage, Size) values ('"+escaped_name+"','"+sciName+"','"+classification+"',"+behaviour+","+plumage+","+size+")"; 
				console.log("\n: Insert in x_birds:" + insert_stmt);

				con.query(insert_stmt, function (err, result, fields)
			    {
					if (err) 
					throw err;
					var birdId = result.insertId;
					console.log ("X_birds Successfully returned Index "+birdId );
				
				    var escaped_pictures= pictures.replace(/'/g,"\\'");
				    var escaped_sounds= sounds.replace(/'/g,"\\'");
				    var escaped_map= map.replace(/'/g,"\\'");
					insert_stmt = "insert into X_birdDescription (birdId, Description, Pictures, Sounds, DistributionMap) values ('"+birdId+"','"+desc+"','"+escaped_pictures+"','"+escaped_sounds+"','"+escaped_map+"')";

					console.log("\n: Insert in X_birdDescription:" + insert_stmt);
					con.query(insert_stmt, function (err, result, fields)
					{
						if (err) 
							throw err;
						var birdDescId = result.insertId;
						console.log ("X_birdDescription Successfully returned Index "+birdDescId );
						res.redirect ("/");
					});
				});
		}
		else //entry is present. Update??
		{
			console.log ("Entry already present for "+sciName);
			res.send ("Entry already present in Database");
		}
	});
}