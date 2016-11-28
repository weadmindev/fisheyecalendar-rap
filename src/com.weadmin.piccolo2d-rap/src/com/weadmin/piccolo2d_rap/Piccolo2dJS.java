package com.weadmin.piccolo2d_rap;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import org.eclipse.rap.json.JsonArray;
import org.eclipse.rap.json.JsonObject;
import org.eclipse.swt.widgets.Composite;

public class Piccolo2dJS extends SVWidgetBase{

	private static final long serialVersionUID = -7580109674486263430L;

	public Piccolo2dJS(Composite parent, int style) {
		super(parent, style);
	}

	//show text
	public void showText(String text){
		JsonObject parameters = new JsonObject();
		parameters.add("text", text);
		super.callRemoteMethod("showText", parameters);
	}
	
	@SuppressWarnings("deprecation")
	public static JsonObject setDate(Date date){
		JsonObject parameters = new JsonObject();
		parameters.add("date", new SimpleDateFormat("yyyy-MM-dd").format(date));
		Date current = new Date();
		if (date.getMonth() == current.getMonth()) {
			parameters.add("currentDay", current.getDate());
		}else{
			parameters.add("currentDay", -1);
		}
		return parameters;
	}
	
	public void showList(Date date,List<JsonObject> list){
		super.setRemoteProp("date", setDate(date));
		listSort(list);
		super.callRemoteMethod("showList", dealWithData(date,list));
	}

	@SuppressWarnings("deprecation")
	public static JsonObject dealWithData(Date date,List<JsonObject> list){
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		int month = calendar.get(Calendar.MONTH)+1;   //the month of search data
		String day,dd = null;
		Date d = null;
		int x,dataMonth = 0;
		JsonArray temp_package_array,temp_retime_array = null;
		JsonObject temp = null;
		JsonObject data = new JsonObject();
		JsonObject json1 = new JsonObject();
		JsonObject json2 = new JsonObject();
		JsonObject json3 = new JsonObject();
		for(JsonObject json:list){
			dd = json.get("savetime").asString();
			d = stringToDate(dd);
			x = d.getHours()*60 + d.getMinutes();
			temp_package_array = new JsonArray();
			temp_retime_array = new JsonArray();
			temp_package_array.add(x).add(Double.valueOf(json.get("package").asString()));
			temp_retime_array.add(x).add(Double.valueOf(json.get("retime").asString()));
			temp = new JsonObject();
			temp.add("savetime", dd);
			temp.add("package", temp_package_array);
			temp.add("retime", temp_retime_array);
			day = String.valueOf(d.getDate());
			dataMonth = d.getMonth()+1;
			if (dataMonth < month) { //previous month
				if (json1.get(day)!=null) {
					json1.set(day, ((JsonArray)json1.get(day)).add(temp));
				}else{
					json1.add(day, new JsonArray().add(temp));
				}
			}
			if (dataMonth == month) {//middle month
				if (json2.get(day)!=null) {
					json2.set(day, ((JsonArray)json2.get(day)).add(temp));
				}else{
					json2.add(day, new JsonArray().add(temp));
				}
			}
			if (dataMonth > month) {//next month
				if (json3.get(day)!=null) {
					json3.set(day, ((JsonArray)json3.get(day)).add(temp));
				}else{
					json3.add(day, new JsonArray().add(temp));
				}
			}
		}
		data.add("prev", json1);
		data.add("current", json2);
		data.add("next", json3);
		return data;
	}
	
	public static void listSort(List<JsonObject> list){
		Collections.sort(list,new Comparator<JsonObject>() {//order by savetime
			public int compare(JsonObject json1,JsonObject json2){
				if (json1!=null&&json2!=null) {
					return json1.get("savetime").asString().compareTo(json2.get("savetime").asString());
				}
				return 0;
			}
		});
	}
	
	public static Date stringToDate(String s){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
		Date date = null;
		try {
			date = sdf.parse(s);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return date;
	}
	
	@Override
	protected void handleSetProp(JsonObject properties) {

	}

	@Override
	protected void handleCallMethod(String method, JsonObject parameters) {

	}

	@Override
	protected void handleCallNotify(String event, JsonObject parameters) {

	}

	@Override
	protected String getWidgetName() {
		return "piccolo2djs";
	}

	@Override
	protected ArrayList<CustomRes> getCustomRes() {
		ArrayList<CustomRes> res = new ArrayList<>();
		res.add(new CustomRes("esl.js", true, false));
		res.add(new CustomRes("zrender.js", true, false));
		res.add(new CustomRes("jquery.js", true, false));
		res.add(new CustomRes("echarts.min.js", true, false));
		res.add(new CustomRes("piccolo2d.js", true, false));
		res.add(new CustomRes("detailCharts.js", true, false));
		res.add(new CustomRes("fishEyeCalendar.js", true, false));
		res.add(new CustomRes("handler.js", true, false));
		return res;
	}

}
