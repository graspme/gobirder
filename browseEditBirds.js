exports.fetchBirdNames = function (res, con) {
	var query_stmt = "select * from X_birds ORDER BY Classification";
	con.query(query_stmt, function (err, result, fields) 
	{
		if (err)
			throw err;
		if (result.length > 0)
		{
			var data = "";
			for (var i = 0; i < result.length ; i++ )
			{
				data += result[i].CommonName+";"+result[i].ScientificName+";"+result[i].Classification+";"+result[i].Behaviour+";"+result[i].Plumage+";"+result[i].Size;
				if (result.length - i != 1)
				{
					data +="#";
				}
			}
			//.log("fetchBirdNames: "+result[0].CommonName);
			res.set('dbdata', data);
			res.sendFile(__dirname + '/browseBirds.html');
		}
	});
}

exports.checkIfExists = function (req, res, con) {
	var query_stmt = "select * from X_birds where CommonName='"+req.query.cname+"'";
	con.query(query_stmt, function (err, result, fields) 
	{
		var msg;
		if (err)
			throw err;
		if (result.length > 0)
		{
			console.log ("checkIfExists: Record Exists for "+req.query.cname);
			msg = "Record Exist for '"+req.query.cname+"'";
			res.send(msg);
			//res.sendFile(__dirname + '/feedBirds.html');
		}
		else
		{
			console.log ("checkIfExists: Record Does not Exists for "+req.query.cname);
			msg = "Record Does not Exist for '"+req.query.cname+"'";
			res.send(msg);
		}
	});
}

exports.fetchBirdDetailsByCName = function (req, res, con) {
	var query_stmt = "select * from X_birds where CommonName='"+req.query.selBird+"'";
	con.query(query_stmt, function (err, result, fields) 
	{'D:\Dropbox\GoBirder\feedBirds.html?CommonName=lapwing&ScientificName=or&Classification=random&Behaviour=4&Plumage=120&Size=12&Description=ggggggg&Pictures=.\Media\lapwing\Photos\image001.png|Male sitting on tree,.\Media\lapwing\Photos\stylesheet.css|mallll,&Sounds=.\Media\lapwing\Sounds\filelist.xml,&DistributionMap=.\Media\lapwing\Map\[object Object]'
		if (err)
			throw err;
		if (result.length == 1)
		{
			console.log("fetchBirdDetailsByCName: "+result[0].birdId);
			res.set ("CommonName", result[0].CommonName);
			res.set ("ScientificName", result[0].ScientificName);
			res.set ("Classification", result[0].Classification);
			res.set ("Behaviour", result[0].Behaviour);
			res.set ("Plumage", result[0].Plumage);
			res.set ("Size", result[0].Size);

			query_stmt = "select * from X_birdDescription where birdID='"+result[0].birdId+"'";
			con.query(query_stmt, function (err, result, fields) 
			{
				if (err)
					throw err;
				if (result.length == 1)
				{
					console.log("fetchBirdDescDetailsByID: "+result[0].birdId);
					res.set ("Description", result[0].Description);
					res.set ("Pictures", result[0].Pictures);
					res.set ("Sounds", result[0].Sounds);
					res.set ("DistributionMap", result[0].DistributionMap);
					res.sendFile (__dirname + '/feedBirds.html')
				}
				else 
					console.log ("fetchBirdDescDetailsByID: Wierd ERROR");
			});
		}
		else 
		{
			console.log ("fetchBirdDetailsByCName: No record found");
			res.sendFile(__dirname + '/feedBirds.html');
		}
	});
}